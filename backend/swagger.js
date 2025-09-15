const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Attendance System API',
      version: '1.0.0',
      description: 'A comprehensive QR-based attendance system with OTP authentication, geolocation verification, and device binding security.',
      contact: {
        name: 'Smart Attendance Team',
        email: 'support@university.edu'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Student: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            enrollmentNumber: { type: 'string' },
            branch: { type: 'string' },
            year: { type: 'string' }
          }
        },
        Teacher: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            department: { type: 'string' },
            employeeId: { type: 'string' }
          }
        },
        Subject: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            subject_name: { type: 'string' },
            subject_code: { type: 'string' },
            department: { type: 'string' },
            semester: { type: 'integer' },
            credits: { type: 'integer' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./server.js'], // Path to the API files
};

const specs = swaggerJSDoc(options);
module.exports = specs;