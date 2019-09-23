//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let configFile = './cl-rest-config.json';
fs = require( 'fs' );
//let should = chai.should();
var expect = require('chai').expect;
let macaroonFile = "./certs/access.macaroon";

//Read the macaroon file
var abc = fs.readFileSync (macaroonFile);
var macaroon = Buffer.from(abc).toString("base64");

//Read the config params
//If the cl-rest server is being run as plugin,
//the config params should match with the ones specified in the c-lightning config 
let rawconfig = fs.readFileSync (configFile, function (err){
if (err){
        console.warn("Failed to read config key");
        console.error( error );
        process.exit(1);
}
});
let config = JSON.parse(rawconfig);
let server = config.PROTOCOL + "://localhost:" + config.PORT;

chai.use(chaiHttp);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//Parent block
describe('lnnode', () => {
    before((done) => {
           done();           
    });

/* Test the Getinfo route */
describe('/GET getinfo', () => {
    it('it should return getinfo from the node', (done) => {
      chai.request(server)
          .get('/v1/getinfo')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                expect(body).to.contain.property('id');
                expect(body).to.contain.property('alias');
                expect(body).to.contain.property('color');
                expect(body).to.contain.property('num_peers');
                expect(body).to.contain.property('num_pending_channels');
                expect(body).to.contain.property('num_active_channels');
                expect(body).to.contain.property('num_inactive_channels');
                expect(body).to.contain.property('address');
            done();
          });
    });
});

/* Test the localRemoteBal route */
describe('/GET localremotebal', () => {
    it('it should return local and remote balance from the node', (done) => {
      chai.request(server)
          .get('/v1/channel/localremotebal')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                expect(body).to.contain.property('localBalance');
                expect(body).to.contain.property('remoteBalance');
            done();
          });
    });
});

/* Test the getChannels route */
describe('/GET Channels', () => {
    it('it should return all channels from the node', (done) => {
      chai.request(server)
          .get('/v1/channel/listChannels')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                expect(body[0]).to.contain.property('id');
                expect(body[0]).to.contain.property('connected');
                expect(body[0]).to.contain.property('state');
                expect(body[0]).to.contain.property('short_channel_id');
                expect(body[0]).to.contain.property('channel_id');
                expect(body[0]).to.contain.property('funding_txid');
                expect(body[0]).to.contain.property('private');
                expect(body[0]).to.contain.property('msatoshi_to_us');
                expect(body[0]).to.contain.property('msatoshi_total');
                expect(body[0]).to.contain.property('their_channel_reserve_satoshis');
                expect(body[0]).to.contain.property('our_channel_reserve_satoshis');
                expect(body[0]).to.contain.property('spendable_msatoshi');
                expect(body[0]).to.contain.property('alias');
            done();
          });
    });
});

});