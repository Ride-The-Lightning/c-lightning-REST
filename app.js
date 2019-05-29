const app = require('express')();

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

app.use('/api/getinfo', require('./routes/getinfo'));
app.use('/api/getinfo/custom', require('./routes/getinfo'));
app.use('/api/newaddr', require('./routes/newaddr'));
app.use('/api/localremotebal', require('./routes/localRemoteBal'));
app.use('/api/getBalance', require('./routes/getBalance'));
app.use('/api/listFunds', require('./routes/listfunds'));

module.exports = app;