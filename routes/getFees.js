var router = require('express').Router();
var getFeeController = require('../controllers/getFees');

// Get the routing fee collected by the node
router.get('/', getFeeController.getFees);

module.exports  = router;