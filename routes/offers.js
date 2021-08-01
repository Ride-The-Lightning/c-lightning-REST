var router = require('express').Router();
var channelController = require('../controllers/offers');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Create Offer
router.post('/offer', tasteMacaroon, channelController.offer);

//List Channels
router.get('/listOffers', tasteMacaroon, channelController.listOffers);

module.exports  = router;