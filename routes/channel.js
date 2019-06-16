var router = require('express').Router();
var channelController = require('../controllers/channel');

router.post('/:pubKey/:sats', channelController.openChannel);
router.get('/', channelController.getChannels);
router.post('/setfee/:id/:base?/:ppm?', channelController.setChannelFee);

module.exports  = router;