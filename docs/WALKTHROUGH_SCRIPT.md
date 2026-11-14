# 3–5 Minute Evaluator Walkthrough Script

**Project:** Bus Booking Management System  
**Internship Candidate:** ALGIONS AI LABS Assessment  
**Recommended Duration:** 4 Minutes  

---

## Act I: Introduction & Landing Page (0:00 - 0:45)
1. **Open Application** at `http://localhost:5173`.
2. **Highlight RedBus Vibe**: Point out the modern, responsive interface, the live search bar, trending route shortcuts (e.g. *Delhi → Chandigarh*, *Mumbai → Pune*), and platform statistics loaded dynamically from MongoDB.
3. **Demonstrate Dynamic Search**:
   - In "Leaving From", select state *Delhi*, city *New Delhi*.
   - In "Going To", select state *Chandigarh*, city *Chandigarh*.
   - Click the **Swap Locations** button to demonstrate reactive location swapping.
   - Click **Search Buses**.

---

## Act II: Search Results & Interactive Seat Selection (0:45 - 1:45)
1. **Filters & Sorting**:
   - Toggle **AC Buses** and **Sleeper Berths** to demonstrate real-time frontend filtering.
   - Change Sort By to **Price: Low to High**.
2. **Interactive Seat Layout**:
   - On the first bus card, click **View Seats**.
   - Show the **movie-hall style layout** with driver cabin position, lower deck and upper deck tabs.
   - Hover over seats to show individual pricing and berth types.
   - Click to select 2 seats (e.g. `L1A`, `L1B`). Note the **5-Minute Countdown Lock Timer** that appears, showing atomic locking across the network.
   - Click **Continue**.

---

## Act III: Passenger Information & Booking Review (1:45 - 2:30)
1. **Dynamic Passenger Forms**:
   - Show that passenger forms match the selected seat count.
   - Fill in passenger names, ages, and genders.
   - Select Boarding and Drop Points from real MongoDB stops.
2. **Server-Side Fare Calculation**:
   - Click **Proceed to Review Booking**.
   - Show the server-calculated fare breakdown: Base Fare + 5% GST + Free Convenience Fee.
   - Point out the transparent **Cancellation Policy Preview**.

---

## Act IV: Simulated Checkout & Official PDF Ticket (2:30 - 3:15)
1. **Payment Simulation**:
   - Click **Proceed to Simulated Payment**.
   - Show the simulated gateway tabs: UPI, Card, Net Banking, and Wallets.
   - Show the **Simulator Mode**: toggle between *Simulate Success* and *Simulate Failure* to demonstrate error resilience.
   - Click **Simulate Pay Now**.
2. **PNR & Official PDF Ticket**:
   - Observe the celebratory banner and unique generated PNR (e.g. `ALG8K2P9Q7`).
   - Click **Download Official PDF**: show the downloaded PDF boarding pass formatted with professional branding, passenger manifest, and QR/barcode mockup.

---

## Act V: Customer Dashboard, Operator Portal & Admin Command Center (3:15 - 4:15)
1. **Customer Dashboard**:
   - Navigate to **My Bookings**.
   - Click **Cancel Ticket** on the booking: highlight the server-side refund calculation preview showing hours until departure and exact refund amount.
   - Confirm cancellation: demonstrate that the status switches to Cancelled and seats are freed.
2. **Operator Portal**:
   - Click **Operator Portal** in navbar (logged in as Operator or Admin).
   - Click **View Manifest** on any scheduled trip: show seat occupancy reconciliation and passenger boarding roster.
3. **Admin Command Center**:
   - Navigate to **Admin Panel**.
   - Show the **Recharts analytics**: 14-day booking bar chart, confirmed vs cancelled pie chart, and live system occupancy.
   - Show **User Management** (1-click activate/deactivate) and the **Immutable Audit Logs table**.

---

## Conclusion
> "This platform delivers an end-to-end, production-ready bus booking architecture with ACID seat concurrency, role-based access control, server-side refund policies, and a modern customer travel interface."
