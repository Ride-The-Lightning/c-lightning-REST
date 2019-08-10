var router = require('express').Router();
var getBalanceController = require('../controllers/getBalance');

//Get the Total, Confirmed and Unconfirmed on-chain balance
router.get('/', getBalanceController.getBalance);

module.exports  = router;