//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../cl-rest');
let should = chai.should();
var expect = require('chai').expect;

chai.use(chaiHttp);
//Parent block
describe('lnnode', () => {
    before((done) => {
           done();           
    });

/* Test the Getinfo route */
describe('/GET getinfo', () => {
    it('it should return getinfo from the node', (done) => {
      chai.request('http://localhost:3001')
          .get('/api/getinfo')
          .end((err, res) => {
                const body = res.body;
                res.should.have.status(200);
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
      chai.request('http://localhost:3001')
          .get('/api/localremotebal')
          .end((err, res) => {
                const body = res.body;
                res.should.have.status(200);
                expect(body).to.contain.property('localBalance');
                expect(body).to.contain.property('remoteBalance');
            done();
          });
    });
});

/* Test the getChannels route */
describe('/GET Channels', () => {
    it('it should return all channels from the node', (done) => {
      chai.request('http://localhost:3001')
          .get('/api/getChannels')
          .end((err, res) => {
                const body = res.body;
                res.should.have.status(200);
                expect(body[0]).to.contain.property('peer_id');
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
                
            done();
          });
    });
});

});