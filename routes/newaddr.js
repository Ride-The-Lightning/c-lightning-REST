var router = require('express').Router();
var newaddrController = require('../controllers/newaddr');

router.get('/', newaddrController.newaddr);

module.exports  = router;