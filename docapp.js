const docapp = require('express')();
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./docs/swagger.json');

//Route for swagger documentation
docapp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = docapp;