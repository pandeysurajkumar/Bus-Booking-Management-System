const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB } = require('../config/db');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Locations & Trip Search API Tests', () => {
  it('should fetch Indian states dynamically from MongoDB', async () => {
    const res = await request(app).get('/api/locations/states');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(20);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('code');
  });

  it('should fetch cities dynamically with state population', async () => {
    const res = await request(app).get('/api/locations/cities');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(50);
  });

  it('should search trips by origin and destination cities', async () => {
    const res = await request(app)
      .get('/api/trips')
      .query({ fromCity: 'New Delhi', toCity: 'Chandigarh' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.trips)).toBe(true);
  });

  it('should filter trips with AC / Sleeper options', async () => {
    const res = await request(app)
      .get('/api/trips')
      .query({ hasAc: 'true' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.trips.forEach((t) => {
      expect(t.busId.amenities.hasAc).toBe(true);
    });
  });

  it('should retrieve a single trip by ID with bus, route, and stop details', async () => {
    const listRes = await request(app).get('/api/trips').query({ limit: 1 });
    expect(listRes.body.data.trips.length).toBeGreaterThan(0);
    const sampleTripId = listRes.body.data.trips[0]._id;

    const res = await request(app).get(`/api/trips/${sampleTripId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(sampleTripId);
    expect(res.body.data.busId).toBeDefined();
    expect(res.body.data.boardingPoints.length).toBeGreaterThan(0);
  });
});
