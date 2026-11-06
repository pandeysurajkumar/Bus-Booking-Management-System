
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Bus Booking Management System API",
      version: "1.0.0",
      description:
        "REST API documentation for the Bus Booking Management System"
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server"
      }
    ]
  },

  apis: ["./src/modules/**/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
