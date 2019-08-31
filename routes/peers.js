var router = require('express').Router();
var connectPeerController = require('../controllers/peers');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Connect with a new network peer
router.post('/:pubKey', tasteMacaroon, connectPeerController.connectPeer);

//List connect peers
router.get('/', tasteMacaroon, connectPeerController.listPeers);

module.exports  = router;