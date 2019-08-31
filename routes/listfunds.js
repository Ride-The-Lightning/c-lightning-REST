var router = require('express').Router();
var listFundsController = require('../controllers/listfunds');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get on-chain and Channel fund information
router.get('/', tasteMacaroon, listFundsController.listFunds);

module.exports  = router;