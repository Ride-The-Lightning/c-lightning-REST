var router = require('express').Router();
var channelController = require('../controllers/channel');

//Open Channel
router.post('/:pubKey/:sats', channelController.openChannel);

//List Channels
router.get('/', channelController.getChannels);

//Update Channel Fee policy
router.post('/setfee/:id/:base?/:ppm?', channelController.setChannelFee);

//Close Channel
router.delete('/:id/:force?/:timeout?', channelController.closeChannel);

module.exports  = router;