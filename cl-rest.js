const app = require('./app');
const PORT = 3001;

const server = app.listen(PORT, function() {
    console.log('api server is ready and listening on port ' + PORT);
})

exports.closeServer = function(){
    server.close();
};

process.on('SIGINT', () => {
    server.close();
    process.exit(0);
})
process.on('SIGTERM', () => {
    server.close();
    process.exit(0);
})