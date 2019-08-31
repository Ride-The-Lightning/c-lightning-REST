var router = require('express').Router();
var localRemoteBalController = require('../controllers/localRemoteBal');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get the aggregate in-bound and out-bound channel capacity of the node
router.get('/', tasteMacaroon, localRemoteBalController.localRemoteBal);

module.exports  = router;