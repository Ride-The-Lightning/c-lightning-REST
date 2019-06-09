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

});