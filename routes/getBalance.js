var router = require('express').Router();
var getBalanceController = require('../controllers/getBalance');

router.get('/', getBalanceController.getBalance);

module.exports  = router;