const docapp = require('express')();
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');
fs = require( 'fs' );
let configFile = './cl-rest-config.json';
api_version = require('./package.json').version;

process.chdir(__dirname);

if (typeof global.REST_PLUGIN_CONFIG === 'undefined') {
  //Read config file when not running as a plugin
  global.logger.log("Reading config file");
  let rawconfig = fs.readFileSync (configFile, function (err){
      if (err)
      {
          global.logger.warn("Failed to read config key");
          global.logger.error( error );
          process.exit(1);
      }
  });
  global.config = JSON.parse(rawconfig);
} else {
  global.config = global.REST_PLUGIN_CONFIG
}

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