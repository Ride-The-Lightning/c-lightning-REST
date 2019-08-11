var router = require('express').Router();
var invoiceController = require('../controllers/invoice');

//Generate bolt11 Invoice
router.post('/genInvoice/:amount/:label/:desc/:expiry?', invoiceController.genInvoice);

module.exports  = router;