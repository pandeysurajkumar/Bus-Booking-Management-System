require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const {
  User,
  Operator,
  State,
  City,
  Bus,
  Route,
  Stop,
  Trip,
  TripSeat,
  SeatLock,
  Booking,
  Passenger,
  Payment,
  Cancellation,
  Refund,
  Review,
  CancellationPolicy,
  AuditLog
} = require('../models');
const { ROLES, SEAT_STATUS, BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../config/constants');
const {
  statesData,
  citiesData,
  operatorsData,
  generateSleeperLayout,
  generateSeaterLayout,
  generateMixedLayout
} = require('./seedData');

const runSeed = async () => {
  try {
    console.log('--- Starting Bus Booking Platform Database Seeder ---');
    await connectDB();

    console.log('[1/10] Dropping previous database to ensure clean schema indexes & idempotency...');
    await mongoose.connection.db.dropDatabase();

    // [2/10] Seed States
    console.log(`[2/10] Seeding ${statesData.length} Indian States...`);
    const createdStates = await State.insertMany(statesData);
    const stateMap = {};
    createdStates.forEach((s) => {
      stateMap[s.code] = s._id;
    });

    // [3/10] Seed Cities
    console.log(`[3/10] Seeding ${citiesData.length} Cities...`);
    const citiesToInsert = citiesData.map((c) => ({
      name: c.name,
      code: c.code,
      stateId: stateMap[c.stateCode],
      isPopular: c.isPopular,
      isActive: true
    }));
    const createdCities = await City.insertMany(citiesToInsert);
    const cityMap = {};
    createdCities.forEach((c) => {
      cityMap[c.name] = c;
    });

    // [4/10] Seed 100+ Boarding and Drop Stops
    console.log('[4/10] Seeding 100+ Boarding & Drop Stops across cities...');
    const stopsData = [];
    const landmarks = ['ISBT Bus Terminal', 'Central Railway Station', 'Airport Junction', 'Toll Plaza', 'Metro Station Pillar 42', 'Highway Bypass Circle'];

    createdCities.forEach((city) => {
      stopsData.push({
        name: `${city.name} Central ISBT`,
        cityId: city._id,
        landmark: 'Near Main Bus Station Platform 1',
        stopType: 'both',
        address: `ISBT Terminal, ${city.name}`
      });
      stopsData.push({
        name: `${city.name} Highway Toll Junction`,
        cityId: city._id,
        landmark: 'NH Highway Service Road',
        stopType: 'both',
        address: `Outer Bypass, ${city.name}`
      });
    });
    const createdStops = await Stop.insertMany(stopsData);

    // [5/10] Seed 30 Operators
    console.log(`[5/10] Seeding ${operatorsData.length} Bus Operators...`);
    const createdOperators = await Operator.insertMany(operatorsData);

    // [6/10] Seed Default Cancellation Policy
    console.log('[6/10] Seeding Standard Tiered Cancellation Policy...');
    const defaultPolicy = await CancellationPolicy.create({
      name: 'Standard Indian Bus Cancellation Policy',
      description: 'Official RedBus/IRCTC-aligned cancellation & refund tiers',
      isDefault: true,
      rules: [
        { minHoursBeforeDeparture: 24, refundPercentage: 90, cancellationFeePercentage: 10, description: 'More than 24 hours: 90% refund' },
        { minHoursBeforeDeparture: 12, refundPercentage: 75, cancellationFeePercentage: 25, description: '12 to 24 hours: 75% refund' },
        { minHoursBeforeDeparture: 4,  refundPercentage: 50, cancellationFeePercentage: 50, description: '4 to 12 hours: 50% refund' },
        { minHoursBeforeDeparture: 0,  refundPercentage: 0,  cancellationFeePercentage: 100, description: 'Less than 4 hours: No refund' }
      ]
    });

    // [7/10] Seed 50 Buses with layouts
    console.log('[7/10] Seeding 50 Buses with detailed seat layouts...');
    const busModels = [
      { model: 'Volvo 9600 Multi-Axle', type: 'Volvo Multi-Axle AC (2+2)', layout: 'seater', seats: 36, getLayout: generateSeaterLayout },
      { model: 'Scania Metrolink Luxury', type: 'AC Sleeper (2+1)', layout: 'sleeper', seats: 30, getLayout: generateSleeperLayout },
      { model: 'BharatBenz 1623 AC', type: 'BharatBenz AC Seater/Sleeper', layout: 'mixed', seats: 30, getLayout: generateMixedLayout },
      { model: 'Mercedes-Benz SuperCoach', type: 'AC Sleeper (2+1)', layout: 'sleeper', seats: 30, getLayout: generateSleeperLayout },
      { model: 'Eicher Skyline Deluxe', type: 'Deluxe Non-AC (2+2)', layout: 'seater', seats: 36, getLayout: generateSeaterLayout }
    ];

    const busesToCreate = [];
    for (let i = 1; i <= 50; i++) {
      const template = busModels[(i - 1) % busModels.length];
      const operator = createdOperators[(i - 1) % createdOperators.length];
      const stateCode = statesData[(i - 1) % statesData.length].code;
      const busNumber = `${stateCode}-${String(10 + (i % 80))}-AB-${String(1000 + i)}`;

      busesToCreate.push({
        operatorId: operator._id,
        busNumber,
        modelName: template.model,
        busType: template.type,
        layoutType: template.layout,
        totalSeats: template.seats,
        amenities: {
          hasAc: !template.type.includes('Non-AC'),
          hasWifi: i % 2 === 0,
          hasCharging: true,
          hasWaterBottle: i % 3 === 0,
          hasBlanket: template.layout !== 'seater',
          hasLiveTracking: true
        },
        seatLayout: template.getLayout(),
        isActive: true
      });
    }
    const createdBuses = await Bus.insertMany(busesToCreate);

    // [8/10] Seed 50 Routes
    console.log('[8/10] Seeding 50 Intercity Routes...');
    const popularRoutePairs = [
      // Northern Routes
      ['New Delhi', 'Chandigarh', 250, 270],
      ['Chandigarh', 'Ludhiana', 105, 120],
      ['Ludhiana', 'Amritsar', 140, 150],
      ['New Delhi', 'Jaipur', 280, 300],
      ['Jaipur', 'Udaipur', 390, 420],
      ['New Delhi', 'Dehradun', 260, 310],
      ['New Delhi', 'Manali', 540, 720],
      ['New Delhi', 'Shimla', 340, 450],
      ['New Delhi', 'Agra', 230, 240],
      ['Agra', 'Lucknow', 335, 330],
      ['Lucknow', 'Varanasi', 315, 360],
      ['Lucknow', 'Kanpur', 90, 110],

      // Western Routes
      ['Mumbai', 'Pune', 150, 190],
      ['Pune', 'Mumbai', 150, 190],
      ['Mumbai', 'Goa', 580, 660],
      ['Pune', 'Goa', 450, 540],
      ['Mumbai', 'Nagpur', 800, 840],
      ['Mumbai', 'Nashik', 170, 210],
      ['Ahmedabad', 'Surat', 260, 270],
      ['Surat', 'Mumbai', 280, 320],
      ['Ahmedabad', 'Vadodara', 110, 120],
      ['Ahmedabad', 'Udaipur', 260, 290],

      // Southern Routes
      ['Bengaluru', 'Chennai', 350, 360],
      ['Chennai', 'Bengaluru', 350, 360],
      ['Bengaluru', 'Hyderabad', 570, 540],
      ['Hyderabad', 'Bengaluru', 570, 540],
      ['Bengaluru', 'Mysuru', 145, 180],
      ['Bengaluru', 'Goa', 560, 660],
      ['Bengaluru', 'Coimbatore', 360, 390],
      ['Chennai', 'Coimbatore', 500, 480],
      ['Chennai', 'Madurai', 460, 450],
      ['Kochi', 'Thiruvananthapuram', 210, 280],
      ['Bengaluru', 'Kochi', 540, 600],
      ['Hyderabad', 'Vijayawada', 275, 300],
      ['Vijayawada', 'Visakhapatnam', 350, 380],

      // Central & Eastern Routes
      ['Indore', 'Bhopal', 195, 210],
      ['Bhopal', 'Indore', 195, 210],
      ['Kolkata', 'Siliguri', 570, 720],
      ['Patna', 'Varanasi', 250, 300],
      ['Bhubaneswar', 'Visakhapatnam', 440, 480],

      // Reverse Routes
      ['Chandigarh', 'New Delhi', 250, 270],
      ['Jaipur', 'New Delhi', 280, 300],
      ['Amritsar', 'Ludhiana', 140, 150],
      ['Dehradun', 'New Delhi', 260, 310],
      ['Manali', 'New Delhi', 540, 720],
      ['Goa', 'Mumbai', 580, 660],
      ['Surat', 'Ahmedabad', 260, 270],
      ['Mysuru', 'Bengaluru', 145, 180],
      ['Coimbatore', 'Chennai', 500, 480],
      ['Varanasi', 'Lucknow', 315, 360]
    ];

    const routesToCreate = [];
    popularRoutePairs.forEach(([origin, dest, dist, dur]) => {
      const originCity = cityMap[origin];
      const destCity = cityMap[dest];
      if (originCity && destCity) {
        routesToCreate.push({
          title: `${origin} - ${dest}`,
          originCityId: originCity._id,
          originStateId: originCity.stateId,
          destinationCityId: destCity._id,
          destinationStateId: destCity.stateId,
          distanceKm: dist,
          estimatedDurationMinutes: dur,
          isActive: true
        });
      }
    });
    const createdRoutes = await Route.insertMany(routesToCreate);

    // [9/10] Seed Demo Users
    console.log('[9/10] Seeding Demo User Accounts (Admin, Operator, Customer)...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@algionsbus.com',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      phone: '+91 99999 00001'
    });

    const operatorUser = await User.create({
      name: 'Zingbus Fleet Manager',
      email: 'operator@zingbus.com',
      password: 'Operator@123',
      role: ROLES.OPERATOR,
      operatorId: createdOperators[0]._id,
      phone: '+91 99999 00002'
    });

    const demoCustomer = await User.create({
      name: 'Arun Kumar',
      email: 'customer@gmail.com',
      password: 'Customer@123',
      role: ROLES.CUSTOMER,
      phone: '+91 98765 43210'
    });

    const demoCustomer2 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      password: 'Customer@123',
      role: ROLES.CUSTOMER,
      phone: '+91 98765 43211'
    });

    const demoCustomer3 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: 'Customer@123',
      role: ROLES.CUSTOMER,
      phone: '+91 98765 43212'
    });

    // [10/10] Seed 100+ Dynamic Trips and individual TripSeats
    console.log('[10/10] Seeding 100+ Trips across dynamic dates with atomic TripSeat inventory...');
    const now = new Date();
    const createdTrips = [];
    const allTripSeats = [];

    // Generate trips across dates: Today, and next 14 days
    let tripCounter = 0;
    const daysOffset = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    for (const offset of daysOffset) {
      const tripDate = new Date(now);
      tripDate.setDate(tripDate.getDate() + offset);
      tripDate.setHours(0, 0, 0, 0);

      // Create 7 to 8 trips per day across different routes
      for (let rIdx = 0; rIdx < 7; rIdx++) {
        tripCounter++;
        const route = createdRoutes[(tripCounter + rIdx) % createdRoutes.length];
        const bus = createdBuses[(tripCounter + rIdx) % createdBuses.length];
        const operator = bus.operatorId;

        // Departure hour between 6:00 AM and 23:00 PM
        const depHour = 6 + ((tripCounter * 3) % 17);
        const depMinute = (tripCounter % 4) * 15;

        const depTime = new Date(tripDate);
        depTime.setHours(depHour, depMinute, 0, 0);

        const arrTime = new Date(depTime.getTime() + route.estimatedDurationMinutes * 60 * 1000);

        // Find stops for boarding and dropping
        const originStops = createdStops.filter((s) => s.cityId.toString() === route.originCityId.toString());
        const destStops = createdStops.filter((s) => s.cityId.toString() === route.destinationCityId.toString());

        const baseFare = Math.round(route.distanceKm * 2.2 + 100);

        const tripDoc = {
          _id: new mongoose.Types.ObjectId(),
          busId: bus._id,
          operatorId: operator,
          routeId: route._id,
          departureDate: tripDate,
          departureTime: depTime,
          arrivalTime: arrTime,
          baseFare,
          totalSeats: bus.totalSeats,
          availableSeats: bus.totalSeats,
          status: offset < 0 ? 'completed' : 'scheduled',
          boardingPoints: originStops.map((s, idx) => ({
            stopId: s._id,
            name: s.name,
            time: new Date(depTime.getTime() + idx * 30 * 60 * 1000),
            landmark: s.landmark
          })),
          dropPoints: destStops.map((s, idx) => ({
            stopId: s._id,
            name: s.name,
            time: new Date(arrTime.getTime() + idx * 20 * 60 * 1000),
            landmark: s.landmark
          })),
          cancellationPolicyId: defaultPolicy._id,
          isActive: true
        };

        createdTrips.push(tripDoc);

        // Generate TripSeat documents for each seat in bus layout
        (bus.seatLayout || []).forEach((layoutSeat) => {
          const multiplier = layoutSeat.priceMultiplier || 1.0;
          allTripSeats.push({
            tripId: tripDoc._id,
            seatNumber: layoutSeat.seatNumber,
            deck: layoutSeat.deck || 'lower',
            seatType: layoutSeat.seatType || 'seater',
            row: layoutSeat.row,
            column: layoutSeat.column,
            fare: Math.round(baseFare * multiplier),
            status: SEAT_STATUS.AVAILABLE
          });
        });
      }
    }

    console.log(`Inserting ${createdTrips.length} Trips...`);
    await Trip.insertMany(createdTrips);

    console.log(`Inserting ${allTripSeats.length} individual TripSeats...`);
    await TripSeat.insertMany(allTripSeats);

    // [Bonus] Seed sample confirmed & cancelled bookings to populate analytics
    console.log('Seeding sample bookings, payments, and audit logs for rich analytics...');
    const sampleTrip = createdTrips.find((t) => t.status === 'scheduled');
    if (sampleTrip) {
      // Pick 2 seats to confirm
      const seatsToBook = ['L1A', 'L1B'];
      const fareSum = sampleTrip.baseFare * 2;
      const taxSum = Math.round(fareSum * 0.05);
      const totalAmount = fareSum + taxSum;

      const pnr = 'ALG7K9D2M1';

      const booking = await Booking.create({
        pnr,
        userId: demoCustomer._id,
        tripId: sampleTrip._id,
        operatorId: sampleTrip.operatorId,
        busId: sampleTrip.busId,
        routeId: sampleTrip.routeId,
        journeyDate: sampleTrip.departureDate,
        seats: seatsToBook,
        passengerCount: 2,
        contactInfo: { email: demoCustomer.email, phone: demoCustomer.phone },
        boardingPoint: sampleTrip.boardingPoints[0],
        dropPoint: sampleTrip.dropPoints[0],
        baseAmount: fareSum,
        taxAmount: taxSum,
        discountAmount: 0,
        totalAmount,
        status: BOOKING_STATUS.CONFIRMED
      });

      const passengers = await Passenger.insertMany([
        { bookingId: booking._id, fullName: 'Arun Kumar', age: 29, gender: 'male', seatNumber: 'L1A' },
        { bookingId: booking._id, fullName: 'Sneha Kumar', age: 27, gender: 'female', seatNumber: 'L1B' }
      ]);

      const payment = await Payment.create({
        bookingId: booking._id,
        transactionId: 'PAY_20261114_SAMPLE01',
        paymentMethod: PAYMENT_METHODS.UPI,
        amount: totalAmount,
        status: PAYMENT_STATUS.SUCCESS,
        paidAt: new Date(),
        methodDetails: { upiId: 'arun@okhdfcbank' }
      });

      booking.passengers = passengers.map((p) => p._id);
      booking.paymentId = payment._id;
      await booking.save();

      // Mark TripSeats as booked
      await TripSeat.updateMany(
        { tripId: sampleTrip._id, seatNumber: { $in: seatsToBook } },
        { $set: { status: SEAT_STATUS.BOOKED, bookingId: booking._id } }
      );

      // Decrement trip available seats
      await Trip.findByIdAndUpdate(sampleTrip._id, { $inc: { availableSeats: -2 } });

      // Create an Audit Log
      await AuditLog.create({
        userId: demoCustomer._id,
        userEmail: demoCustomer.email,
        role: ROLES.CUSTOMER,
        action: 'BOOKING_CONFIRMED',
        resource: 'Booking',
        resourceId: booking._id,
        details: { pnr, seats: seatsToBook, totalAmount }
      });
    }

    console.log('--- Database Seeding Completed Successfully! ---');
    console.log('Demo Credentials Summary:');
    console.log('1. Admin:    email: admin@algionsbus.com    | password: Admin@123');
    console.log('2. Operator: email: operator@zingbus.com    | password: Operator@123');
    console.log('3. Customer: email: customer@gmail.com      | password: Customer@123');
    console.log('------------------------------------------------');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed execution failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
