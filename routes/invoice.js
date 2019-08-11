var router = require('express').Router();
var invoiceController = require('../controllers/invoice');

//Generate bolt11 invoice
router.post('/genInvoice/:amount/:label/:desc/:expiry?', invoiceController.genInvoice);

//List invoices
router.get('/listInvoices/:label?', invoiceController.listInvoice);

module.exports  = router;