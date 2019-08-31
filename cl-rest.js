const app = require('./app');
const mcrn = require('./utils/bakeMacaroons');
fs = require( 'fs' );
const PORT = 3001;

const { execSync } = require( 'child_process' );
const execOptions = { encoding: 'utf-8', windowsHide: true };
let key = './certs/key.pem';
let certificate = './certs/certificate.pem';
let macaroonFile = './certs/access.macaroon';
let rootKey = './certs/rootKey.key';

console.log('--- Starting the cl-rest server ---\n');
console.log('Changing the working directory to :' + __dirname);
process.chdir(__dirname);

//Check for and generate SSl certs
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

//Check for and generate access macaroon
if ( ! fs.existsSync( macaroonFile ) || ! fs.existsSync( rootKey ) ) {
    try {
        var buns = mcrn.bakeMcrns();
    }
    catch ( error ) {
        console.error( error );
    }

    //Write the rootKey.key file
    fs.writeFileSync(rootKey, buns[0], function (err) {
        if (err) throw err;
    });

    //Write the admin.access macaroon
    fs.writeFileSync(macaroonFile, buns[1], function (err) {
        if (err) throw err;
    });
}

//Read rootkey from file
global.verRootkey = fs.readFileSync (rootKey);

//Temp code for reading base64 macaroon value
console.log('macaroon converted to base64:\n', Buffer.from(fs.readFileSync (macaroonFile)).toString("base64"));
//End temp code

//Instantiate the server
server = require( 'https' ).createServer( options, app );

//Start the server
server.listen(PORT, function() {
    console.log('--- cl-rest api server is ready and listening on port: ' + PORT + ' ---');
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