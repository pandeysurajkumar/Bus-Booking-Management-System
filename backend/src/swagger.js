const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bus Booking Management System API',
      version: '1.0.0',
      description:
        'Production-grade RESTful API for Bus Booking & Fleet Management. Inspired by RedBus and modern movie-ticketing systems with atomic seat locking and role-based access control.',
      contact: {
        name: 'ALGIONS Assessment Candidate',
        email: 'support@algionsbus.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from /api/auth/login or /api/auth/register'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'operator', 'admin'] },
            phone: { type: 'string' }
          }
        },
        TripSeat: {
          type: 'object',
          properties: {
            seatNumber: { type: 'string' },
            deck: { type: 'string', enum: ['lower', 'upper'] },
            seatType: { type: 'string', enum: ['seater', 'sleeper'] },
            row: { type: 'number' },
            column: { type: 'number' },
            fare: { type: 'number' },
            status: { type: 'string', enum: ['available', 'locked', 'booked', 'blocked'] }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            pnr: { type: 'string' },
            journeyDate: { type: 'string', format: 'date-time' },
            seats: { type: 'array', items: { type: 'string' } },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
