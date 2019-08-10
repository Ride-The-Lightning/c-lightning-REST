var router = require('express').Router();
var paymentsController = require('../controllers/payments');

//Pay with a Bolt11 invoice
router.post('/:invoice', paymentsController.payInvoice);

module.exports  = router;