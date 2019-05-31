const app = require('./app');
const PORT = 3001;
//LN_PATH is the path containing lightning-rpc file
global.ln = require('lightning-client')(process.env.LN_PATH);

const server = app.listen(PORT, function() {
    console.log('api server is ready and listening on port ' + PORT);
})

exports.closeServer = function(){
    server.close();
};

process.on('SIGINT', () => {
    server.close();
    process.exit();
})
process.on('SIGTERM', () => {
    server.close();
    process.exit();
})