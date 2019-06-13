var router = require('express').Router();
var channelController = require('../controllers/channel');

router.post('/:pubKey/:sats', channelController.openChannel);
router.get('/', channelController.getChannels);

module.exports  = router;