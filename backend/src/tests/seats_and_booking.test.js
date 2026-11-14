const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB } = require('../config/db');
const { Trip, TripSeat, User } = require('../models');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Seat Locking & Booking Flow Tests', () => {
  let customerAToken = '';
  let customerBToken = '';
  let testTripId = '';
  let testSeats = [];

  beforeAll(async () => {
    // Login Customer A
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@gmail.com', password: 'Customer@123' });
    customerAToken = resA.body.data.token;

    // Login Customer B
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.sharma@example.com', password: 'Customer@123' });
    customerBToken = resB.body.data.token;

    // Find a scheduled trip with available seats
    const trip = await Trip.findOne({ status: 'scheduled', availableSeats: { $gt: 10 } });
    testTripId = trip._id.toString();

    // Get 2 available seats from this trip
    const seats = await TripSeat.find({ tripId: testTripId, status: 'available' }).limit(2);
    testSeats = seats.map((s) => s.seatNumber);
  });

  it('should fetch seat layout with live statuses for a trip', async () => {
    const res = await request(app).get(`/api/seats/trip/${testTripId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.seats)).toBe(true);
    expect(res.body.data.seats.length).toBeGreaterThan(0);
    expect(res.body.data.seats[0]).toHaveProperty('status');
  });

  it('Customer A should successfully lock selected seats for 5 minutes', async () => {
    const res = await request(app)
      .post('/api/seats/lock')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        tripId: testTripId,
        seatNumbers: testSeats
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.seatNumbers).toEqual(testSeats);
    expect(res.body.lockExpiresAt).toBeDefined();
  });

  it('Customer B should be REJECTED when trying to lock the same seats (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/seats/lock')
      .set('Authorization', `Bearer ${customerBToken}`)
      .send({
        tripId: testTripId,
        seatNumbers: testSeats
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject booking if passenger count does not match selected seats', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        tripId: testTripId,
        seats: testSeats, // 2 seats
        passengers: [
          { fullName: 'Passenger One', age: 30, gender: 'male', seatNumber: testSeats[0] }
          // Only 1 passenger sent for 2 seats!
        ],
        boardingPoint: { name: 'Origin ISBT', time: new Date().toISOString() },
        dropPoint: { name: 'Destination Drop', time: new Date().toISOString() },
        contactInfo: { email: 'customer@gmail.com', phone: '+91 98765 43210' },
        paymentMethod: 'upi',
        simulatedSuccess: true
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  let confirmedPNR = '';
  const testIdempotencyKey = `IDEMP_${Date.now()}`;

  it('Customer A should successfully confirm booking with simulated payment & generate unique PNR', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerAToken}`)
      .set('x-idempotency-key', testIdempotencyKey)
      .send({
        tripId: testTripId,
        seats: testSeats,
        passengers: [
          { fullName: 'Passenger One', age: 30, gender: 'male', seatNumber: testSeats[0] },
          { fullName: 'Passenger Two', age: 28, gender: 'female', seatNumber: testSeats[1] }
        ],
        boardingPoint: { name: 'Origin ISBT', time: new Date().toISOString() },
        dropPoint: { name: 'Destination Drop', time: new Date().toISOString() },
        contactInfo: { email: 'customer@gmail.com', phone: '+91 98765 43210' },
        paymentMethod: 'upi',
        simulatedSuccess: true
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pnr).toMatch(/^ALG/);
    expect(res.body.data.status).toBe('confirmed');
    expect(res.body.data.paymentId).toBeDefined();
    confirmedPNR = res.body.data.pnr;
  });

  it('should handle idempotent replay without creating duplicate booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerAToken}`)
      .set('x-idempotency-key', testIdempotencyKey)
      .send({
        tripId: testTripId,
        seats: testSeats,
        passengers: [
          { fullName: 'Passenger One', age: 30, gender: 'male', seatNumber: testSeats[0] },
          { fullName: 'Passenger Two', age: 28, gender: 'female', seatNumber: testSeats[1] }
        ],
        boardingPoint: { name: 'Origin ISBT', time: new Date().toISOString() },
        dropPoint: { name: 'Destination Drop', time: new Date().toISOString() },
        contactInfo: { email: 'customer@gmail.com', phone: '+91 98765 43210' },
        paymentMethod: 'upi',
        simulatedSuccess: true
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pnr).toBe(confirmedPNR);
  });

  it('should find booking details by PNR', async () => {
    const res = await request(app).get(`/api/bookings/pnr/${confirmedPNR}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pnr).toBe(confirmedPNR);
    expect(res.body.data.passengers.length).toBe(2);
  });

  it('should download ticket PDF buffer', async () => {
    const res = await request(app).get(`/api/bookings/${confirmedPNR}/ticket-pdf`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body).toBeDefined();
  });
});
