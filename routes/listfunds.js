var router = require('express').Router();
var listFundsController = require('../controllers/listfunds');

router.get('/', listFundsController.listFunds);

module.exports  = router;