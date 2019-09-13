const app = require('./app');
const mcrn = require('./utils/bakeMacaroons');
fs = require( 'fs' );
var PORT = 3001;
var EXECMODE = "production";

const { execSync } = require( 'child_process' );
const execOptions = { encoding: 'utf-8', windowsHide: true };
let key = './certs/key.pem';
let certificate = './certs/certificate.pem';
let macaroonFile = './certs/access.macaroon';
let rootKey = './certs/rootKey.key';
let configFile = './cl-rest-config.json';

console.log('--- Starting the cl-rest server ---');
console.log('Changing the working directory to :' + __dirname);
process.chdir(__dirname);

//Read config file
console.log("Reading config file");
let rawconfig = fs.readFileSync (configFile, function (err){
    if (err)
    {
        console.warn("Failed to read config key");
        console.error( error );
        process.exit(1);
    }
});
global.config = JSON.parse(rawconfig);

if (!config.PORT || !config.PROTOCOL || !config.EXECMODE)
{
    console.warn("Incomplete config params");
    process.exit(1);
}

PORT = config.PORT;
EXECMODE = config.EXECMODE;

//Create certs folder
try {
    if (!fs.existsSync('./certs')){
      fs.mkdirSync('./certs')
    }
  } catch (err) {
    console.error(err)
}

//Check for and generate SSl certs
if ( ! fs.existsSync( key ) || ! fs.existsSync( certificate ) ) {
    console.log("Generating SSL cert and key");
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

console.log("Reading SSL cert and key");
const options = {
    key: fs.readFileSync( key ),
    cert: fs.readFileSync( certificate )
};

//Check for and generate access key and macaroon
if ( ! fs.existsSync( macaroonFile ) || ! fs.existsSync( rootKey ) ) {
    console.log("Generating macaroon file and key");
    try {
        var buns = mcrn.bakeMcrns();
    }
    catch ( error ) {
        console.error( error );
    }

    //Write the rootKey.key file
    fs.writeFileSync(rootKey, buns[0], function (err) {
        if (err)
        {
            console.warn("Failed to write macaroon root key");
            console.error( error );
            process.exit(1);
        }
    });

    //Write the admin.access macaroon
    fs.writeFileSync(macaroonFile, buns[1], function (err) {
        if (err)
        {
            console.warn("Failed to write macaroon file");
            console.error( error );
            process.exit(1);
        }
    });
}

//Read rootkey from file
console.log("Reading rootkey for macaroon");
global.verRootkey = fs.readFileSync (rootKey, function (err){
    if (err)
    {
        console.warn("Failed to read root key");
        console.error( error );
        process.exit(1);
    }
});

//Display base64 macaroon value in the log, in test mode only
if(EXECMODE === "test")
    console.log('macaroon converted to base64:\n', Buffer.from(fs.readFileSync (macaroonFile)).toString("base64"));
//End temp code

//Instantiate the server
if(config.PROTOCOL === "https")
    server = require( 'https' ).createServer( options, app );
else if(config.PROTOCOL === "http")
    server = require( 'http' ).createServer( app );
else {
    console.warn("Invalid PROTOCOL\n");
    process.exit(1);
}

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