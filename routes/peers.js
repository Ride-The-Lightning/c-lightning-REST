var router = require('express').Router();
var connectPeerController = require('../controllers/peers');

//Connect with a new network peer
router.post('/:pubKey', connectPeerController.connectPeer);

//List connect peers
router.get('/', connectPeerController.listPeers);

module.exports  = router;