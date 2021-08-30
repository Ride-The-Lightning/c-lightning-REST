const app = require('express')();
const bodyparser = require('body-parser');
let configFile = './cl-rest-config.json';
fs = require('fs');

function prepDataForLogging(msg) {
  return typeof msg === 'string' ? msg : JSON.stringify(msg)
}

function configLogger(config) {
  return {
    log(msg) { if (config.EXECMODE === 'test') config.PLUGIN.log(prepDataForLogging(msg), "info") },
    warn(msg) { config.PLUGIN.log(prepDataForLogging(msg), "warn") },
    error(msg) { config.PLUGIN.log(prepDataForLogging(msg), "error") }
  }
}

if (typeof global.REST_PLUGIN_CONFIG === 'undefined') {
  //Read config file when not running as a plugin
  console.log("Reading config file");
  let rawconfig = fs.readFileSync(configFile, function (err) {
    if (err) {
      console.warn("Failed to read config key");
      console.error(error);
      process.exit(1);
    }
  });
  global.config = JSON.parse(rawconfig);
  global.config.PLUGIN = console;
} else {
  global.config = global.REST_PLUGIN_CONFIG;
}

global.logger = configLogger(global.config);

//LN_PATH is the path containing lightning-rpc file
let lnpath = (global.config.LNRPCPATH && global.config.LNRPCPATH.trim() !== '') ? global.config.LNRPCPATH.trim() : process.env.LN_PATH;
global.ln = require('./lightning-client-js')(lnpath);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, filePath, macaroon, encodingtype"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

//Use declared routes here
app.use('/v1/getinfo', require('./routes/getinfo'));
app.use('/v1/utility', require('./routes/getinfo'));
app.use('/v1/newaddr', require('./routes/newaddr'));
app.use('/v1/getBalance', require('./routes/getBalance'));
app.use('/v1/listFunds', require('./routes/listfunds'));
app.use('/v1/getFees', require('./routes/getFees'));
app.use('/v1/withdraw', require('./routes/withdraw'));
app.use('/v1/peer', require('./routes/peers'));
app.use('/v1/channel', require('./routes/channel'));
app.use('/v1/pay', require('./routes/payments'));
app.use('/v1/invoice', require('./routes/invoice'));
app.use('/v1/network', require('./routes/network'));
app.use('/v1/rpc', require('./routes/rpc'));
app.use('/v1/offers', require('./routes/offers'));

module.exports = app;