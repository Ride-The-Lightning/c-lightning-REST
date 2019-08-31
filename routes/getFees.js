var router = require('express').Router();
var getFeeController = require('../controllers/getFees');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get the routing fee collected by the node
router.get('/', tasteMacaroon, getFeeController.getFees);

module.exports  = router;