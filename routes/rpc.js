var router = require('express').Router();
var rpcController = require('../controllers/rpc');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get the basic information from the node
router.post('/', tasteMacaroon, rpcController.rpc);

module.exports  = router;