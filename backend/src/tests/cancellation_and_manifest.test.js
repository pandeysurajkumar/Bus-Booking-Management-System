const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB } = require('../config/db');
const { Booking, TripSeat, Trip } = require('../models');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Cancellation, Refunds & Operator Manifest Reconciliation Tests', () => {
  let customerToken = '';
  let operatorToken = '';
  let confirmedBooking = null;

  beforeAll(async () => {
    // Login Customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@gmail.com', password: 'Customer@123' });
    customerToken = custRes.body.data.token;

    // Login Operator
    const opRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'operator@zingbus.com', password: 'Operator@123' });
    operatorToken = opRes.body.data.token;

    // Find any confirmed booking belonging to customer
    confirmedBooking = await Booking.findOne({
      userId: custRes.body.data.user._id,
      status: 'confirmed'
    });
  });

  it('should fetch pre-flight refund estimate with tiered policy breakdown', async () => {
    expect(confirmedBooking).toBeDefined();

    const res = await request(app)
      .get(`/api/cancellations/estimate/${confirmedBooking._id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('refundPercentage');
    expect(res.body.data).toHaveProperty('refundAmount');
    expect(res.body.data).toHaveProperty('cancellationFee');
  });

  it('should cancel booking and process simulated refund credit', async () => {
    const res = await request(app)
      .post('/api/cancellations')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: confirmedBooking._id,
        reason: 'Change of travel plans'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.refund).toBeDefined();
    expect(res.body.refund.status).toBe('completed');
  });

  it('should release cancelled seats back to AVAILABLE in TripSeat collection', async () => {
    const seats = await TripSeat.find({
      tripId: confirmedBooking.tripId,
      seatNumber: { $in: confirmedBooking.seats }
    });

    seats.forEach((seat) => {
      expect(seat.status).toBe('available');
      expect(seat.bookingId).toBeNull();
    });
  });

  it('should reconcile operator manifest with passenger list and occupancy percentage', async () => {
    const res = await request(app)
      .get(`/api/operator/manifest/${confirmedBooking.tripId}`)
      .set('Authorization', `Bearer ${operatorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reconciliation).toBeDefined();
    expect(res.body.data.reconciliation).toHaveProperty('occupancyPercentage');
    expect(res.body.data.reconciliation).toHaveProperty('occupiedSeats');
    expect(res.body.data.reconciliation).toHaveProperty('totalSeats');
  });
});
