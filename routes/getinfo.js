var router = require('express').Router();
var getinfoController = require('../controllers/getinfo');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get the basic information from the node
router.get('/', tasteMacaroon, getinfoController.getinfo);

//Creates a signature of the message with the node's secret key
router.post('/signMessage', tasteMacaroon, getinfoController.signMessage);

module.exports  = router;