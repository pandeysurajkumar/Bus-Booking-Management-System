# Entity-Relationship (ER) Diagram & Database Architecture

## Overview
The **Bus Booking Management System** is built on MongoDB using Mongoose ODM with strict schema validation, referential integrity, and compound unique constraints to guarantee ACID guarantees for concurrent seat reservations.

---

## Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : places
    USER ||--o{ SEAT_LOCK : creates
    USER ||--o{ CANCELLATION : initiates
    USER ||--o{ REVIEW : writes
    USER ||--o{ AUDIT_LOG : triggers
    OPERATOR ||--o{ BUS : owns
    OPERATOR ||--o{ TRIP : operates
    OPERATOR ||--o{ BOOKING : fulfills
    OPERATOR ||--o{ REVIEW : receives

    STATE ||--o{ CITY : contains
    STATE ||--o{ ROUTE : "origin / destination state"
    CITY ||--o{ STOP : contains
    CITY ||--o{ ROUTE : "origin / destination city"

    BUS ||--o{ TRIP : assigned_to

    ROUTE ||--o{ TRIP : scheduled_for

    TRIP ||--o{ TRIP_SEAT : has_inventory
    TRIP ||--o{ SEAT_LOCK : locks
    TRIP ||--o{ BOOKING : booked_under
    TRIP ||--o{ REVIEW : reviewed_in

    CANCELLATION_POLICY ||--o{ TRIP : applies_to

    BOOKING ||--o{ PASSENGER : contains
    BOOKING ||--|| PAYMENT : settled_by
    BOOKING ||--o| CANCELLATION : cancelled_via
    BOOKING ||--o| REVIEW : reviewed_by

    CANCELLATION ||--|| REFUND : generates

    USER {
        ObjectId _id PK
        string name
        string email UK "Indexed"
        string password "Hashed bcrypt"
        string role "customer | operator | admin"
        string phone
        ObjectId operatorId FK
        boolean isActive
        Date createdAt
    }

    OPERATOR {
        ObjectId _id PK
        string name
        string companyName UK
        string registrationNumber UK
        string contactEmail
        string contactPhone
        number rating "1.0 - 5.0"
        number totalReviews
        boolean isActive
    }

    STATE {
        ObjectId _id PK
        string name UK
        string code UK "MH, DL, KA..."
        boolean isActive
    }

    CITY {
        ObjectId _id PK
        string name
        ObjectId stateId FK
        string code
        boolean isPopular
        boolean isActive
    }

    STOP {
        ObjectId _id PK
        string name
        ObjectId cityId FK
        string landmark
        string stopType "boarding | drop | both"
        string address
        boolean isActive
    }

    BUS {
        ObjectId _id PK
        ObjectId operatorId FK
        string busNumber UK
        string modelName
        string busType "AC Sleeper | Volvo 2+2..."
        string layoutType "seater | sleeper | mixed"
        number totalSeats
        object amenities "AC, WiFi, Charging..."
        array seatLayout "Template layout"
        boolean isActive
    }

    ROUTE {
        ObjectId _id PK
        string title "City A - City B"
        ObjectId originCityId FK
        ObjectId originStateId FK
        ObjectId destinationCityId FK
        ObjectId destinationStateId FK
        number distanceKm
        number estimatedDurationMinutes
        boolean isActive
    }

    TRIP {
        ObjectId _id PK
        ObjectId busId FK
        ObjectId operatorId FK
        ObjectId routeId FK
        Date departureDate "Indexed"
        Date departureTime
        Date arrivalTime
        number baseFare
        number totalSeats
        number availableSeats
        string status "scheduled | running | completed | cancelled"
        array boardingPoints
        array dropPoints
        ObjectId cancellationPolicyId FK
        boolean isActive
    }

    TRIP_SEAT {
        ObjectId _id PK
        ObjectId tripId FK "Indexed"
        string seatNumber "Indexed"
        string deck "lower | upper"
        string seatType "seater | sleeper"
        number row
        number column
        number fare
        string status "available | locked | booked | blocked"
        ObjectId lockedBy FK
        Date lockExpiresAt "TTL Indexed"
        ObjectId bookingId FK
    }

    SEAT_LOCK {
        ObjectId _id PK
        ObjectId tripId FK
        ObjectId userId FK
        array seatNumbers
        Date expiresAt "TTL Index (expires: 0)"
        string sessionId
    }

    BOOKING {
        ObjectId _id PK
        string pnr UK "10-char Unique Indexed"
        ObjectId userId FK
        ObjectId tripId FK
        ObjectId operatorId FK
        ObjectId busId FK
        ObjectId routeId FK
        Date journeyDate
        array seats "Array of seat numbers"
        number passengerCount
        array passengers FK
        object boardingPoint
        object dropPoint
        number baseAmount
        number taxAmount
        number totalAmount
        string status "pending | confirmed | cancelled"
        ObjectId paymentId FK
        ObjectId cancellationId FK
        string idempotencyKey UK
        Date createdAt
    }

    PASSENGER {
        ObjectId _id PK
        ObjectId bookingId FK
        string fullName
        number age
        string gender "male | female | other"
        string seatNumber
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId bookingId FK
        string transactionId UK
        string paymentMethod "upi | card | net_banking | wallet"
        number amount
        string status "pending | processing | success | failed"
        object methodDetails
        object gatewayResponse
        Date paidAt
    }

    CANCELLATION {
        ObjectId _id PK
        ObjectId bookingId FK
        ObjectId userId FK
        string reason
        array cancelledSeats
        number originalAmount
        number refundAmount
        number cancellationFee
        number refundPercentage
        string status "pending | completed"
        Date cancelledAt
    }

    REFUND {
        ObjectId _id PK
        ObjectId cancellationId FK
        ObjectId bookingId FK
        ObjectId paymentId FK
        number refundAmount
        string refundTransactionId UK
        string status "completed"
        Date processedAt
    }

    CANCELLATION_POLICY {
        ObjectId _id PK
        string name UK
        boolean isDefault
        array rules "Tiers: >24h 90%, 12-24h 75%..."
        boolean isActive
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK
        string userEmail
        string role
        string action "Indexed: BOOKING_CONFIRMED..."
        string resource
        string resourceId
        object details
        string ipAddress
        Date createdAt "Indexed"
    }
```

---

## Compound Indexes & Concurrency Safeguards

1. **TripSeat Double-Booking Prevention**:
   ```javascript
   tripSeatSchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });
   ```
   *Guarantees at the database engine level that no two records can exist for the same seat on any given trip.*

2. **Seat Lock Expiration**:
   ```javascript
   tripSeatSchema.index({ status: 1, lockExpiresAt: 1 });
   seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
   ```
   *Powers ultra-fast index queries for expired locks and auto-eviction.*

3. **Trip Search Performance**:
   ```javascript
   tripSchema.index({ routeId: 1, departureDate: 1, status: 1 });
   tripSchema.index({ operatorId: 1, departureDate: 1 });
   ```
   *Ensures zero full-collection scans even with hundreds of thousands of daily scheduled trips.*

4. **Booking Lookup & Idempotency**:
   ```javascript
   bookingSchema.index({ pnr: 1 }, { unique: true });
   bookingSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
   bookingSchema.index({ userId: 1, createdAt: -1 });
   ```
