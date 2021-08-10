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
router.get('/listForwards/:offset/:maxLen/:reverse', tasteMacaroon, channelController.listForwards);

module.exports  = router;