var router = require('express').Router();
var openChannelController = require('../controllers/openChannel');

router.post('/:pubKey/:sats', openChannelController.openChannel);

module.exports  = router;