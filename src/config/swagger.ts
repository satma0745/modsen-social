import swaggerJSDoc from 'swagger-jsdoc'
import { version } from '../../package.json'

const createSpec = (): object => {
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Modsen Social REST API',
      version,
      description: "Modsen's 3rd test task: Social REST API.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  }

  const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['src/features/**/controller.ts'],
  }

  return swaggerJSDoc(options)
}

export { createSpec }
