const swaggerJSDoc = require('swagger-jsdoc')
const { version } = require('../../package.json')

const createSpec = () => {
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Modsen Social REST API',
      version,
      description: "Modsen's 3rd test task: Social REST API.",
    },
  }

  const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['src/routes/**/*.js'],
  }

  return swaggerJSDoc(options)
}

module.exports = { createSpec }