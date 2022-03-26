const app = require('./app');
const docapp = require('./docapp');
const mcrn = require('./utils/bakeMacaroons');
const wsServer = require('./utils/webSocketServer');
fs = require( 'fs' );

const { execSync } = require( 'child_process' );
const execOptions = { encoding: 'utf-8', windowsHide: true };

const cdir = process.env.CL_REST_STATE_DIR ? process.env.CL_REST_STATE_DIR : __dirname;
global.logger.log("cl-rest state dir: " + cdir);
process.chdir(cdir);

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
            `openssl req -x509 -newkey rsa:2048 -keyout ./certs/key.tmp.pem -out ${ certificate } -days 365 -nodes -subj "/C=US/ST=Foo/L=Bar/O=Baz/CN=c-lightning-rest" --addext "subjectAltName = DNS:${ DOMAIN }"`,
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
server.listen(PORT, function() {
    global.logger.warn('--- cl-rest api server is ready and listening on port: ' + PORT + ' ---');
})

//Start the docserver
docserver.listen(DOCPORT, function() {
    global.logger.warn('--- cl-rest doc server is ready and listening on port: ' + DOCPORT + ' ---');
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
