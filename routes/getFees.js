var router = require('express').Router();
var getFeeController = require('../controllers/getFees');

router.get('/', getFeeController.getFees);

module.exports  = router;