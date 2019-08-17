const app = require('./app');
fs = require( 'fs' );
const PORT = 3001;

const { execSync } = require( 'child_process' );
const execOptions = { encoding: 'utf-8', windowsHide: true };
let key = './certs/key.pem';
let certificate = './certs/certificate.pem';

if ( ! fs.existsSync( key ) || ! fs.existsSync( certificate ) ) {
    try {
        execSync( 'openssl version', execOptions );
        execSync(
            `openssl req -x509 -newkey rsa:2048 -keyout ./certs/key.tmp.pem -out ${ certificate } -days 365 -nodes -subj "/C=US/ST=Foo/L=Bar/O=Baz/CN=localhost"`,
            execOptions
        );
        execSync( `openssl rsa -in ./certs/key.tmp.pem -out ${ key }`, execOptions );
        execSync( 'rm ./certs/key.tmp.pem', execOptions );
    } catch ( error ) {
        console.error( error );
    }
}

const options = {
    key: fs.readFileSync( key ),
    cert: fs.readFileSync( certificate ),
    passphrase : 'password'
};

server = require( 'https' ).createServer( options, app );

server.listen(PORT, function() {
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