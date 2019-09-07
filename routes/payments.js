var router = require('express').Router();
var paymentsController = require('../controllers/payments');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Pay with a Bolt11 invoice
router.post('/:invoice', tasteMacaroon, paymentsController.payInvoice);

//Get the list of invoices via listpay
router.get('/listPays', tasteMacaroon, paymentsController.listPays);

//Get the list of invoices via listpayments
router.get('/listPayments', tasteMacaroon, paymentsController.listPayments);

//Decode a bolt11 invoice
router.get('/decodePay/:invoice', tasteMacaroon, paymentsController.decodePay);

module.exports  = router;