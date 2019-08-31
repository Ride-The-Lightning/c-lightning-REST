var router = require('express').Router();
var getBalanceController = require('../controllers/getBalance');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get the Total, Confirmed and Unconfirmed on-chain balance
router.get('/', tasteMacaroon, getBalanceController.getBalance);

module.exports  = router;