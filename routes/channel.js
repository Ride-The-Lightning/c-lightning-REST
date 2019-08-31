var router = require('express').Router();
var channelController = require('../controllers/channel');
var localRemoteBalController = require('../controllers/localRemoteBal');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Open Channel
router.post('/openChannel/:pubKey/:sats', tasteMacaroon, channelController.openChannel);

//List Channels
router.get('/listChannels', tasteMacaroon, channelController.listChannels);

//Update Channel Fee policy
router.post('/setChannelFee/setfee/:id/:base?/:ppm?', tasteMacaroon, channelController.setChannelFee);

//Close Channel
router.delete('/closeChannel/:id/:force?/:timeout?', tasteMacaroon, channelController.closeChannel);

//Get the aggregate in-bound and out-bound channel capacity of the node
router.get('/localRemoteBal', tasteMacaroon, localRemoteBalController.localRemoteBal);

module.exports  = router;