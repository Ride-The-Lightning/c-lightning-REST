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

if (config.PROTOCOL === 'https')
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//Parent block
describe('lnnode', () => {
    before((done) => {
           done();           
    });

// Test the Getinfo route
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
                expect(body).to.contain.property('binding');
                expect(body).to.contain.property('version');
                expect(body).to.contain.property('blockheight');
                expect(body).to.contain.property('network');
                expect(body).to.contain.property('fees_collected_msat');
                expect(body).to.contain.property('lightning-dir');
            done();
          });
    });
});

// Test the localRemoteBal route
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

// Test the listChannels route
describe('/GET listChannels', () => {
    it('it should return all channels from the node', (done) => {
      chai.request(server)
          .get('/v1/channel/listChannels')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach(channel => {
                        expect(channel).to.contain.property('id');
                        expect(channel).to.contain.property('connected');
                        expect(channel).to.contain.property('state');
                        expect(channel).to.contain.property('short_channel_id');
                        expect(channel).to.contain.property('channel_id');
                        expect(channel).to.contain.property('funding_txid');
                        expect(channel).to.contain.property('private');
                        expect(channel).to.contain.property('their_channel_reserve_satoshis');
                        expect(channel).to.contain.property('our_channel_reserve_satoshis');
                        expect(channel).to.contain.property('spendable_msatoshi');
                        expect(channel).to.contain.property('alias');
                    });
                }
            done();
          });
    });
});

// Test the listFunds route
describe('/GET listFunds', () => {
    it('it should return all on-chain outputs and channel fund info from the node', (done) => {
      chai.request(server)
          .get('/v1/listFunds')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body.outputs;
                const body2 = res.body.channels;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach(output => {
                        expect(output).to.contain.property('txid');
                        expect(output).to.contain.property('output');
                        expect(output).to.contain.property('amount_msat');
                        expect(output).to.contain.property('scriptpubkey');
                        expect(output).to.contain.property('address');
                        expect(output).to.contain.property('status');
                        expect(output).to.contain.property('blockheight');
                        expect(output).to.contain.property('reserved');
                    });
                }
                if(body2 && body2.length){
                    body2.forEach(channel => {
                        expect(channel).to.contain.property('peer_id');
                        expect(channel).to.contain.property('connected');
                        expect(channel).to.contain.property('state');
                        expect(channel).to.contain.property('short_channel_id');
                        expect(channel).to.contain.property('our_amount_msat');
                        expect(channel).to.contain.property('amount_msat');
                        expect(channel).to.contain.property('funding_txid');
                        expect(channel).to.contain.property('funding_output');
                    });
                }
            done();
          });
    });
});

// Test the getBalance route
describe('/GET getBalance', () => {
    it('it should return confirmed, un-confirmed and total on-chain balance from the node', (done) => {
      chai.request(server)
          .get('/v1/getBalance')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                expect(body).to.contain.property('totalBalance');
                expect(body).to.contain.property('confBalance');
                expect(body).to.contain.property('unconfBalance');
            done();
          });
    });
});

// Test the newaddr route
/*
describe('/GET newaddr', () => {
    it('it should return a bitcoin address from the node', (done) => {
      chai.request(server)
          .get('/v1/newaddr')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                expect(body).to.contain.property('address');
            done();
          });
    });
});
*/

// Test the listpeers route
describe('/GET listPeers', () => {
    it('it should return list of connected peers from the node', (done) => {
      chai.request(server)
          .get('/v1/peer/listPeers')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach( peer => {
                        expect(peer).to.contain.property('id');
                        expect(peer).to.contain.property('connected');
                        expect(peer).to.contain.property('alias');
                    });
                }
            done();
          });
    });
});

// Test the listForwards route
describe('/GET listForwards', () => {
    it('it should return list of forwarded transactions from the node', (done) => {
      chai.request(server)
          .get('/v1/channel/listForwards')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach( forward => {
                        console.log("in_channel: " + forward.in_channel);
                        expect(forward).to.contain.property('in_channel');
                        if(forward.status == "settled")
                            expect(forward).to.contain.property('out_channel');
                        expect(forward).to.contain.property('in_msat');
                        if(forward.status == "settled") {
                        expect(forward).to.contain.property('out_msat');
                        expect(forward).to.contain.property('fee');
                        expect(forward).to.contain.property('fee_msat');
                        }
                        expect(forward).to.contain.property('status');
                        //expect(forward).to.contain.property('received_time');
                        //if(forward.status == "settled")
                        //    expect(forward).to.contain.property('resolved_time');
                    });
                }
            done();
          });
    });
});

// Test the listPays route
describe('/GET listPays', () => {
    it('it should return list of payments made from the node', (done) => {
      chai.request(server)
          .get('/v1/pay/listPays')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body.pays;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach( pay => {
                        console.log("bolt11: " + pay.bolt11);
                        expect(pay).to.contain.property('bolt11');
                        expect(pay).to.contain.property('status');
                        expect(pay).to.contain.property('amount_sent_msat');
                        if(pay.status == 'complete') {
                            expect(pay).to.contain.property('preimage');
                            expect(pay).to.contain.property('amount_msat');
                        }
                    });
                }
            done();
          });
    });
});

// Test the listPayments route
describe('/GET listPayments', () => {
    it('it should return list of payments made from the node', (done) => {
      chai.request(server)
          .get('/v1/pay/listPayments')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body.payments;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach( payment => {
                        console.log("payment_hash: " + payment.payment_hash);

                        expect(payment).to.contain.property('id');
                        expect(payment).to.contain.property('payment_hash');
                        expect(payment).to.contain.property('destination');
                        expect(payment).to.contain.property('amount_msat');
                        expect(payment).to.contain.property('amount_sent_msat');
                        expect(payment).to.contain.property('created_at');
                        expect(payment).to.contain.property('bolt11');
                        expect(payment).to.contain.property('status');
                        expect(payment).to.contain.property('payment_preimage');
                    });
                }
            done();
          });
    });
});

// Test the listInvoices route
describe('/GET listInvoices', () => {
    it('it should return list of invoices available on the node', (done) => {
      chai.request(server)
          .get('/v1/invoice/listInvoices')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body.invoices;
                expect(res).to.have.status(200);
                if(body && body.length){
                    body.forEach( invoice => {
                        let label = invoice.label;
                        console.log("label: " + label);

                        expect(invoice).to.contain.property('label');
                        expect(invoice).to.contain.property('bolt11');
                        expect(invoice).to.contain.property('payment_hash');
                        if(label.substr(0,7) != "keysend"){
                            expect(invoice).to.contain.property('amount_msat');
                        }
                        expect(invoice).to.contain.property('status');
                        expect(invoice).to.contain.property('description');
                        expect(invoice).to.contain.property('expires_at');
                    });
                }
            done();
          });
    });
});

// Test the estimatefees route
describe('/GET estimatefees', () => {
    it('it should return estimatefees from the node', (done) => {
      chai.request(server)
          .get('/v1/network/estimatefees')
          .set('macaroon', macaroon)
          .end((err, res) => {
                const body = res.body;
                expect(res).to.have.status(200);
                expect(body).to.contain.property('opening');
                expect(body).to.contain.property('mutual_close');
                expect(body).to.contain.property('unilateral_close');
                expect(body).to.contain.property('delayed_to_us');
                expect(body).to.contain.property('htlc_resolution');
                expect(body).to.contain.property('penalty');
                expect(body).to.contain.property('min_acceptable');
                expect(body).to.contain.property('max_acceptable');
            done();
          });
    });
});

});