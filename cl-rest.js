const cdir = process.env.CL_REST_STATE_DIR ? process.env.CL_REST_STATE_DIR : __dirname;
process.chdir(cdir);

const app = require('./app');
const docapp = require('./docapp');
const mcrn = require('./utils/bakeMacaroons');
const wsServer = require('./utils/webSocketServer');
fs = require( 'fs' );

const { execSync } = require( 'child_process' );
const execOptions = { encoding: 'utf-8', windowsHide: true };

global.logger.log("cl-rest state dir: " + cdir);

let key = './certs/key.pem';
let certificate = './certs/certificate.pem';
let macaroonFile = './certs/access.macaroon';
let rootKey = './certs/rootKey.key';

global.logger.warn('--- Starting the cl-rest server ---');

if (!config.PORT || !config.DOCPORT || !config.PROTOCOL || !config.EXECMODE)
{
    global.logger.warn("Incomplete config params");
    process.exit(1);
}

//Set config params
const PORT = config.PORT;
const EXECMODE = config.EXECMODE;
const DOCPORT = config.DOCPORT;
const DOMAIN = config.DOMAIN || "localhost";

// Check if any interface on the device has an IPv6 address
const os = require('os');
const networkInterfaces = os.networkInterfaces();
const hasIPv6 = Object.values(networkInterfaces).some((interfaces) => {
    return interfaces.some((iface) => {
      return iface.family === 'IPv6';
    });
  });
if (hasIPv6)
    var bindaddr = config.BIND || "::";
else
    var bindaddr = config.BIND || "0.0.0.0";

const BIND = bindaddr;
global.logger.log("--------------");
global.logger.log("Bind address -> " + BIND);
global.logger.log("--------------");

//Create certs folder
try {
    if (!fs.existsSync('./certs')){
      fs.mkdirSync('./certs')
    }
  } catch (err) {
    global.logger.error(err)
}

//Check for and generate SSl certs
if ( ! fs.existsSync( key ) || ! fs.existsSync( certificate ) ) {
    global.logger.log("Generating SSL cert and key");
    try {
        execSync( 'openssl version', execOptions );
        execSync(
            `openssl req -x509 -newkey rsa:2048 -keyout ./certs/key.tmp.pem -out ${ certificate } -days 365 -nodes -subj "/C=US/ST=Foo/L=Bar/O=Baz/CN=c-lightning-rest" -addext "subjectAltName = DNS:${ DOMAIN }"`,
            execOptions
        );
        execSync( `openssl rsa -in ./certs/key.tmp.pem -out ${ key }`, execOptions );
        execSync( 'rm ./certs/key.tmp.pem', execOptions );
    } catch ( error ) {
        global.logger.error( error );
    }
}

global.logger.log("Reading SSL cert and key");
const options = {
    key: fs.readFileSync( key ),
    cert: fs.readFileSync( certificate )
};

//Check for and generate access key and macaroon
if ( ! fs.existsSync( macaroonFile ) || ! fs.existsSync( rootKey ) ) {
    global.logger.log("Generating macaroon file and key");
    try {
        var buns = mcrn.bakeMcrns();
    }
    catch ( error ) {
        global.logger.error( error );
    }

    //Write the rootKey.key file
    fs.writeFileSync(rootKey, buns[0], function (err) {
        if (err)
        {
            global.logger.warn("Failed to write macaroon root key");
            global.logger.error( error );
            process.exit(1);
        }
    });

    //Write the admin.access macaroon
    fs.writeFileSync(macaroonFile, buns[1], function (err) {
        if (err)
        {
            global.logger.warn("Failed to write macaroon file");
            global.logger.error( error );
            process.exit(1);
        }
    });
}

//Read rootkey from file
global.logger.log("Reading rootkey for macaroon");
global.verRootkey = fs.readFileSync (rootKey, function (err){
    if (err)
    {
        global.logger.warn("Failed to read root key");
        global.logger.error( error );
        process.exit(1);
    }
});

//Display hex macaroon value in the log, in test mode only
if(EXECMODE === "test")
{
    global.logger.log('macaroon converted to hex:');
    global.logger.log(Buffer.from(fs.readFileSync (macaroonFile)).toString("hex"));
    global.logger.log('macaroon converted to base64:');
    global.logger.log(Buffer.from(fs.readFileSync (macaroonFile)).toString("base64"));
}

//Instantiate the server
if(config.PROTOCOL === "https")
    server = require( 'https' ).createServer( options, app );
else if(config.PROTOCOL === "http")
    server = require( 'http' ).createServer( app );
else {
    global.logger.warn("Invalid PROTOCOL\n");
    process.exit(1);
}

try {
    wsServer.mountWebServer(server);
} catch (err) {
    global.logger.warn("Failed to start websocket server");
    global.logger.error( err );
}

//Instantiate the doc server
docserver = require( 'http' ).createServer( docapp );

//Start the server
server.listen(PORT, BIND, function() {
    global.logger.warn('--- cl-rest api server is ready and listening on ' + BIND + ':' + PORT + ' ---');
})

//Start the docserver
docserver.listen(DOCPORT, BIND, function() {
    global.logger.warn('--- cl-rest doc server is ready and listening on ' + BIND + ':' + DOCPORT + ' ---');
})

exports.closeServer = function(){
    server.close();
    docserver.close();
};

process.on('SIGINT', () => {
    server.close();
    docserver.close();
    process.exit(0);
})
process.on('SIGTERM', () => {
    server.close();
    docserver.close();
    process.exit(0);
})

module.exports = { server, wsServer };
