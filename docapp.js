const docapp = require('express')();
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');
fs = require( 'fs' );
api_version = require('./package.json').version;

// Reference: Disable self signed certificates from browser
// https://stackoverflow.com/questions/7580508/getting-chrome-to-accept-self-signed-localhost-certificate
// https://stackoverflow.com/questions/20088/is-there-a-way-to-make-firefox-ignore-invalid-ssl-certificates

const cdir = process.env.CL_REST_STATE_DIR ? process.env.CL_REST_STATE_DIR : __dirname;
process.chdir(cdir);

var hostdef = 'localhost:' + config.PORT;

var swaggerDefinition = {
    info: {
      title: 'C-Lightning-REST',
      version: api_version,
      description: 'REST API suite for C-Lightning',
    },
    schemes: [config.PROTOCOL],
    host: hostdef,
    basePath: '/v1',
    securityDefinitions: {
      MacaroonAuth: {
        type: 'apiKey',
        name: 'macaroon',
        in: 'header',
      }
    }
  };

var options = {
    swaggerDefinition,
    apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

docapp.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', config.PROTOCOL + '://' + hostdef);
    res.send(swaggerSpec);
});

//Route for swagger documentation
docapp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = docapp;