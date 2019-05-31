var router = require('express').Router();
var newaddrController = require('../controllers/newaddr');

router.get('/:addrType?', newaddrController.newaddr);

module.exports  = router;