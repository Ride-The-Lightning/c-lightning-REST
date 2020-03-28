const app = require('express')();
const bodyparser = require('body-parser');

if (typeof global.REST_PLUGIN_CONFIG === 'undefined') {
  global.logger = console
} else {
  function pluginMsg(msg) {
    return typeof msg === 'string' ? msg : JSON.stringify(msg)
  }
  global.logger = {
    log(msg) {global.REST_PLUGIN_CONFIG.PLUGIN.log(pluginMsg(msg), "info")},
    warn(msg) {global.REST_PLUGIN_CONFIG.PLUGIN.log(pluginMsg(msg), "warn")},
    error(msg) {global.REST_PLUGIN_CONFIG.PLUGIN.log(pluginMsg(msg), "error")}
  }
}

//LN_PATH is the path containing lightning-rpc file
global.ln = require('./lightning-client-js')(process.env.LN_PATH);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
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

module.exports = app;