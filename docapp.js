const docapp = require('express')();
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');
fs = require( 'fs' );
api_version = require('./package.json').version;

const cdir = process.env.CL_REST_STATE_DIR ? process.env.CL_REST_STATE_DIR : __dirname;
process.chdir(cdir);

var hostdef = 'localhost:' + config.PORT;

var swaggerDefinition = {
    info: {
      title: 'C-Lightning-REST',
      version: api_version,
      description: 'REST API suite for C-Lightning',
    },
    host: hostdef,
    basePath: '/v1',
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'macaroon',
        scheme: 'bearer',
        in: 'header',
      },
    },
  };

var options = {
    swaggerDefinition,
    apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

docapp.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

//Route for swagger documentation
docapp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = docapp;