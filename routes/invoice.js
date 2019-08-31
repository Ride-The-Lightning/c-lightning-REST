var router = require('express').Router();
var invoiceController = require('../controllers/invoice');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Generate bolt11 invoice
router.post('/genInvoice/:amount/:label/:desc/:expiry?', tasteMacaroon, invoiceController.genInvoice);

//List invoices
router.get('/listInvoices/:label?', tasteMacaroon, invoiceController.listInvoice);

//Delete expired invoices
router.delete('/delExpiredInvoice/:maxexpiry?', tasteMacaroon, invoiceController.delExpiredInvoice);

module.exports  = router;