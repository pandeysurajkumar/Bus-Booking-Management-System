# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

The **Bus Booking Management System** uses a decoupled client-server architecture with an Express.js REST API and a React 18 single-page application.

```mermaid
graph TD
    Client["React.js SPA (Vite + Tailwind + Recharts)"]
    API["Express.js API Layer (Helmet, CORS, RateLimiter, JWT)"]
    AuthSvc["Auth Service & RBAC"]
    TripSvc["Trip & Search Service"]
    LockSvc["Atomic Seat Lock Service"]
    BookingSvc["Booking & PNR Service"]
    PaySvc["Simulated Payment Gateway"]
    CancelSvc["Cancellation & Tiered Refund Service"]
    AuditSvc["Audit Logging Subsystem"]
    DB[(MongoDB Cluster / Local Database)]

    Client -->|REST / JSON| API
    API --> AuthSvc
    API --> TripSvc
    API --> LockSvc
    API --> BookingSvc
    API --> CancelSvc
    BookingSvc --> PaySvc
    API --> AuditSvc

    AuthSvc --> DB
    TripSvc --> DB
    LockSvc --> DB
    BookingSvc --> DB
    CancelSvc --> DB
    AuditSvc --> DB
```

---

## 2. Concurrency Control & Atomic Seat Locking Sequence

When multiple users attempt to select and book the same seat simultaneously, concurrency is managed using conditional atomic queries:

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Customer A
    actor UserB as Customer B
    participant API as Express API
    participant LockService as SeatLock Service
    participant Mongo as MongoDB (TripSeat Collection)

    UserA->>API: POST /api/seats/lock { tripId, seatNumbers: ["L1A"] }
    API->>LockService: lockSeats(tripId, ["L1A"], userA_Id)
    LockService->>Mongo: findOneAndUpdate({ tripId, seatNumber: "L1A", status: "available" }, { $set: { status: "locked", lockedBy: userA_Id, lockExpiresAt: +5m } })
    Mongo-->>LockService: Returns updated document (Success)
    LockService-->>API: 200 OK (Seats locked for 5 minutes)
    API-->>UserA: 200 OK { lockExpiresAt }

    Note over UserB, Mongo: Customer B tries to lock the same seat simultaneously
    UserB->>API: POST /api/seats/lock { tripId, seatNumbers: ["L1A"] }
    API->>LockService: lockSeats(tripId, ["L1A"], userB_Id)
    LockService->>Mongo: findOneAndUpdate({ tripId, seatNumber: "L1A", status: "available" }, { $set: { status: "locked", lockedBy: userB_Id } })
    Mongo-->>LockService: null (Match condition failed)
    LockService-->>API: 409 Conflict: Seat L1A is locked by another passenger
    API-->>UserB: 409 Conflict Error
```

---

## 3. Booking Confirmation & Payment State Flow

```mermaid
stateDiagram-v2
    [*] --> SEAT_LOCKED: User selects & locks seats
    SEAT_LOCKED --> PAYMENT_PENDING: Submits Passenger details
    PAYMENT_PENDING --> PAYMENT_PROCESSING: Initiates Simulated Payment
    PAYMENT_PROCESSING --> BOOKING_CONFIRMED: Mock Payment Returns SUCCESS
    PAYMENT_PROCESSING --> PAYMENT_FAILED: Mock Payment Returns DECLINED

    PAYMENT_FAILED --> SEAT_LOCKED: Retry with different payment method
    PAYMENT_FAILED --> [*]: Lock expires (5 min auto release)

    BOOKING_CONFIRMED --> TICKET_DOWNLOADED: PDF Generated & PNR issued
    BOOKING_CONFIRMED --> CANCELLED: Customer cancels ticket
    CANCELLED --> REFUND_PROCESSED: Tiered refund credited to source
```

---

## 4. Tiered Cancellation & Refund Engine

Refund calculation happens strictly server-side relative to current timestamp and departure date:

$$ \Delta T = T_{\text{departure}} - T_{\text{now}} $$

| Time Remaining ($\Delta T$) | Refund % | Cancellation Fee % | Action |
| :--- | :--- | :--- | :--- |
| $> 24\text{ hours}$ | **90%** | 10% | Instant Simulated Refund + Seat Inventory Restored |
| $12 - 24\text{ hours}$ | **75%** | 25% | Instant Simulated Refund + Seat Inventory Restored |
| $4 - 12\text{ hours}$ | **50%** | 50% | Instant Simulated Refund + Seat Inventory Restored |
| $< 4\text{ hours}$ | **0%** | 100% | No Refund + Seat Inventory Restored |
