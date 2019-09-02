var router = require('express').Router();
var networkController = require('../controllers/network');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get Route
router.get('/getRoute/:pubKey/:msats/:riskFactor?', tasteMacaroon, networkController.getRoute);

module.exports  = router;