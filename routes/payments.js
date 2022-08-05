var router = require('express').Router();
var paymentsController = require('../controllers/payments');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Pay with a Bolt11 invoice
router.post('/', tasteMacaroon, paymentsController.payInvoice);

//Get the list of invoices via listpay
router.get('/listPays', tasteMacaroon, paymentsController.listPays);

//Get the list of invoices via listpayments
router.get('/listPayments', tasteMacaroon, paymentsController.listPayments);

//Decode a bolt11 invoice
router.get('/decodePay/:invoice', tasteMacaroon, paymentsController.decodePay);

//Decode a bolt11 invoice
router.post('/keysend', tasteMacaroon, paymentsController.keysend);

//Wait sendpay
router.get('/waitSendPay/:paymentHash/:timeout?/:partId?', tasteMacaroon, paymentsController.waitSendPayment);

module.exports  = router;