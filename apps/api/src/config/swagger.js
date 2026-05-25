import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.js';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Doon Silk E-commerce API',
      version: '1.0.0',
      description: 'REST API for Doon Silk MERN e-commerce backend.'
    },
    servers: [
      { url: `${config.API_BASE_URL}/api/v1`, description: 'Configured API server' },
      { url: 'http://localhost:5000/api/v1', description: 'Local development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' }
      }
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/docs/*.yaml']
});
