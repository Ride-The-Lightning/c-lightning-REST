var router = require('express').Router();
var newaddrController = require('../controllers/newaddr');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Generate a new on-chain address
//Specify the parameter 'p2sh-segwit' to get the segwit address
router.get('/', tasteMacaroon, newaddrController.newAddr);

module.exports  = router;