var router = require('express').Router();
var channelController = require('../controllers/offers');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Create Offer
router.post('/offer', tasteMacaroon, channelController.offer);

//List Offers
router.get('/listOffers', tasteMacaroon, channelController.listOffers);

//Fetch Invoice
router.post('/fetchInvoice', tasteMacaroon, channelController.fetchInvoice);

module.exports  = router;