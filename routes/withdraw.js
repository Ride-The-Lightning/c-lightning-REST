var router = require('express').Router();
var withdrawController = require('../controllers/withdraw');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Withdraw funds on-chain
router.post('/', tasteMacaroon, withdrawController.withdraw);

module.exports  = router;