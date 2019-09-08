var router = require('express').Router();
var invoiceController = require('../controllers/invoice');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Generate bolt11 invoice
router.post('/genInvoice', tasteMacaroon, invoiceController.genInvoice);

//List invoices
router.get('/listInvoices', tasteMacaroon, invoiceController.listInvoice);

//Delete expired invoices
router.delete('/delExpiredInvoice', tasteMacaroon, invoiceController.delExpiredInvoice);

module.exports  = router;