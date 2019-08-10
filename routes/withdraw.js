var router = require('express').Router();
var withdrawController = require('../controllers/withdraw');

//Withdraw funds on-chain
router.post('/:addr/:sats', withdrawController.withdraw);

module.exports  = router;