var router = require('express').Router();
var paymentsController = require('../controllers/payments');

//Pay with a Bolt11 invoice
router.post('/:invoice', paymentsController.payInvoice);

//Get the list of invoices
router.get('/listPays/:invoice?', paymentsController.listPays);

module.exports  = router;