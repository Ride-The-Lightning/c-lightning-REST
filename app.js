const app = require('express')();
//LN_PATH is the path containing lightning-rpc file
global.ln = require('lightning-client')(process.env.LN_PATH);

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
app.use('/api/getinfo', require('./routes/getinfo'));
app.use('/api/getinfo/custom', require('./routes/getinfo'));
app.use('/api/newaddr', require('./routes/newaddr'));
app.use('/api/localremotebal', require('./routes/localRemoteBal'));
app.use('/api/getBalance', require('./routes/getBalance'));
app.use('/api/listFunds', require('./routes/listfunds'));
app.use('/api/getFees', require('./routes/getFees'));
app.use('/api/withdraw', require('./routes/withdraw'));
app.use('/api/peer', require('./routes/peers'));
app.use('/api/openChannel', require('./routes/openChannel'));

module.exports = app;