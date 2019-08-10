var router = require('express').Router();
var paymentsController = require('../controllers/payments');

//Pay with a Bolt11 invoice
router.post('/:invoice', paymentsController.payInvoice);

//Get the list of invoices via listpay
router.get('/listPays/:invoice?', paymentsController.listPays);

//Get the list of invoices via listpayments
router.get('/listPayments/:invoice?', paymentsController.listPayments);

module.exports  = router;