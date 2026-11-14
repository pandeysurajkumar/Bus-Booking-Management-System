# Technical Report: Bus Booking Management System

**Assessment:** Full-Stack Developer & Software Architect Evaluation  
**Organization:** ALGIONS AI LABS PRIVATE LIMITED  
**Date:** November 2026  

---

## 1. Executive Summary

This report documents the architectural design, implementation decisions, concurrency patterns, and security mechanisms engineered for the **Bus Booking Management System**. The solution delivers an end-to-end, multi-tier travel reservation platform inspired by RedBus and leading theatrical booking engines, featuring server-side Role-Based Access Control (RBAC), atomic seat reservation locks, automated tiered refund calculations, and full administrative telemetry.

---

## 2. Technical Stack Justification

| Layer | Selected Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Lightning-fast HMR, lean bundle size (gzip ~225kB), component-driven UI. |
| **Styling & Icons** | Tailwind CSS + Lucide React | Highly customizable responsive utility classes, zero runtime CSS overhead, accessible SVG icons. |
| **State & Navigation** | React Router DOM v7 + Context API | Decoupled route guards for Customer, Operator, and Admin roles. |
| **Data Visualization** | Recharts | Declarative SVG-based charting for time-series booking trends and occupancy analytics. |
| **Backend Runtime** | Node.js + Express.js | Event-driven, non-blocking I/O ideal for concurrent seat-locking requests and JSON REST APIs. |
| **Database & ODM** | MongoDB 8.x + Mongoose ODM | Document-oriented model with compound indexes, TTL eviction, and atomic `$set`/`findOneAndUpdate` operations. |
| **Validation** | Zod Schema Validation | Strict type-safe payload validation on both incoming HTTP controllers and frontend forms. |
| **Documentation** | Swagger / OpenAPI 3.0 | Self-documenting interactive API portal mounted directly at `/api/docs`. |
| **Testing** | Jest + Supertest | Automated integration test coverage spanning authentication, search, concurrency conflicts, and refunds. |

---

## 3. High-Concurrency Seat Locking & Transaction Architecture

### 3.1 The Double-Booking Challenge
In high-demand bus and transit reservation platforms, multiple concurrent users frequently attempt to purchase the same high-demand seat (e.g., front-row sleeper berth) simultaneously. A naive `find()` followed by `save()` creates a classic race condition (Time-of-Check to Time-of-Use).

### 3.2 Implemented Mitigation
1. **Compound Unique Index**:
   ```javascript
   tripSeatSchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });
   ```
2. **Conditional Atomic State Mutation**:
   ```javascript
   const updatedSeat = await TripSeat.findOneAndUpdate(
     {
       tripId,
       seatNumber,
       $or: [
         { status: 'available' },
         { status: 'locked', lockExpiresAt: { $lt: now } },
         { status: 'locked', lockedBy: userId }
       ]
     },
     {
       $set: {
         status: 'locked',
         lockedBy: userId,
         lockExpiresAt: new Date(now.getTime() + 5 * 60 * 1000)
       }
     },
     { new: true }
   );
   ```
   *If any seat in a multi-seat batch fails to acquire, the transaction engine immediately triggers an atomic rollback of all previously acquired seats and returns an HTTP 409 Conflict.*

3. **Multi-Document Transaction Support with Fallback**:
   To ensure resilience across both MongoDB Replica Sets (Atlas, production clusters) and local standalone development instances, operations are wrapped in `withTransaction(async (session) => { ... })`. When a replica set is active, multi-document ACID transactions (`session.withTransaction`) are leveraged; on standalone nodes, atomic operators ensure consistency.

---

## 4. Security Architecture

- **Authentication**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, expired after 7 days.
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (10 rounds). Schema configuration explicitly sets `select: false` to prevent accidental disclosure.
- **Role-Based Access Control (RBAC)**: Express middleware (`protect` and `authorize('admin', 'operator')`) enforces access control on sensitive endpoints.
- **API Hardening**: `helmet` security headers, strict CORS origin policies, and tiered `express-rate-limit` rate-limiters on public and authentication endpoints.
- **Audit Logging**: Asynchronous audit logging subsystem recording critical events (`USER_LOGIN`, `SEATS_LOCKED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`) with IP addresses, user agents, and structured metadata.

---

## 5. Automated Test Suite Results

The automated test suite runs 24 unit and integration tests across 4 suites via Jest and Supertest:

```text
PASS src/tests/seats_and_booking.test.js
PASS src/tests/cancellation_and_manifest.test.js
PASS src/tests/auth.test.js
PASS src/tests/trips.test.js

Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        30.51 s
```

---

## 6. Known Limitations & Production Enhancements

1. **Payment Gateway Integration**: Current payment processing uses a mock simulation service designed with clear interfaces (`PaymentService.processPayment`). Production deployment requires plugging in the Razorpay / Stripe Node SDK.
2. **SMS / WhatsApp Alerts**: Real-world RedBus integrations deliver SMS updates on boarding time. Pluggable notification hooks can connect Twilio or Gupshup.
3. **Real-Time WebSockets**: Currently, seat lock updates are polled every 15 seconds. Integrating Socket.io would provide sub-second visual seat status updates across concurrent browsers.
