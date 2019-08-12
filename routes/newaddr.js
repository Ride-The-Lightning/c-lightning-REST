var router = require('express').Router();
var newaddrController = require('../controllers/newaddr');

//Generate a new on-chain address
//Specify the parameter 'p2sh-segwit' to get the segwit address
router.get('/:addrType?', newaddrController.newAddr);

module.exports  = router;