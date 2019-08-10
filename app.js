const app = require('express')();
//LN_PATH is the path containing lightning-rpc file
global.ln = require('./lightning-client-js')(process.env.LN_PATH);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, filePath"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});

//Use declared routes here
app.use('/v1/rtl', require('./routes/rtl'));
app.use('/v1/getinfo', require('./routes/getinfo'));
app.use('/v1/newaddr', require('./routes/newaddr'));
app.use('/v1/localremotebal', require('./routes/localRemoteBal'));
app.use('/v1/getBalance', require('./routes/getBalance'));
app.use('/v1/listFunds', require('./routes/listfunds'));
app.use('/v1/getFees', require('./routes/getFees'));
app.use('/v1/withdraw', require('./routes/withdraw'));
app.use('/v1/peer', require('./routes/peers'));
app.use('/v1/listPeers', require('./routes/peers'));
app.use('/v1/openChannel', require('./routes/channel'));
app.use('/v1/getChannels', require('./routes/channel'));
app.use('/v1/setChannelFee', require('./routes/channel'));
app.use('/v1/closeChannel', require('./routes/channel'));

module.exports = app;