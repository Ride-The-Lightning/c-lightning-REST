var router = require('express').Router();
var connectPeerController = require('../controllers/peers');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Connect with a new network peer
router.post('/connect/:pubKey', tasteMacaroon, connectPeerController.connectPeer);

//List connect peers
router.get('/listPeers', tasteMacaroon, connectPeerController.listPeers);

//Disconnect from a network peer
router.delete('/disconnect/:pubKey', tasteMacaroon, connectPeerController.disconnectPeer);

module.exports  = router;