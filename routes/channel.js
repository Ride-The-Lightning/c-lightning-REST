var router = require('express').Router();
var channelController = require('../controllers/channel');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Open Channel
router.post('/:pubKey/:sats', tasteMacaroon, channelController.openChannel);

//List Channels
router.get('/', tasteMacaroon, channelController.getChannels);

//Update Channel Fee policy
router.post('/setfee/:id/:base?/:ppm?', tasteMacaroon, channelController.setChannelFee);

//Close Channel
router.delete('/:id/:force?/:timeout?', tasteMacaroon, channelController.closeChannel);

module.exports  = router;