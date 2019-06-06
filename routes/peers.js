var router = require('express').Router();
var connectPeerController = require('../controllers/peers');

router.post('/:pubKey', connectPeerController.connectPeer);
router.get('/', connectPeerController.listPeers);

module.exports  = router;