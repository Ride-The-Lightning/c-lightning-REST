var router = require('express').Router();
var listFundsController = require('../controllers/listfunds');

//Get on-chain and Channel fund information
router.get('/', listFundsController.listFunds);

module.exports  = router;