var router = require('express').Router();
var withdrawController = require('../controllers/withdraw');

router.post('/:addr/:sats', withdrawController.withdraw);

module.exports  = router;