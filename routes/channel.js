var router = require('express').Router();
var channelController = require('../controllers/channel');
var localRemoteBalController = require('../controllers/localRemoteBal');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Open Channel
router.post('/openChannel', tasteMacaroon, channelController.openChannel);

//List Channels
router.get('/listChannels', tasteMacaroon, channelController.listChannels);

//Update Channel Fee policy
router.post('/setChannelFee', tasteMacaroon, channelController.setChannelFee);

//Close Channel
router.delete('/closeChannel/:id', tasteMacaroon, channelController.closeChannel);

//Get the aggregate in-bound and out-bound channel capacity of the node
router.get('/localRemoteBal', tasteMacaroon, localRemoteBalController.localRemoteBal);

//Get the list of htlcs forwarded
router.get('/listForwards', tasteMacaroon, channelController.listForwards);

//Get the list of htlcs forwarded, along with starting and ending indices
router.get('/listForwardsFilter', tasteMacaroon, channelController.listForwardsFilter);

//Update the funding policy for dual funded channels and liquidy ads
router.post('/funderUpdate', tasteMacaroon, channelController.funderUpdate);

module.exports  = router;