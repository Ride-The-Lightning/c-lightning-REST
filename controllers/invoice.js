var wsServer = require('../utils/webSocketServer');

//This controller houses all the invoice functions

//Function # 1
//Invoke the 'invoice' command to generate a bolt11 invoice
//Arguments - Amount in msat [required], label [required], description [required], expiry in seconds [optional]
/**
* @swagger
* /invoice/genInvoice:
*   post:
*     tags:
*       - Invoice
*     name: invoice
*     summary: Generate a BOLT11 invoice
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: amount
*         description: Amount in milli satoshis
*         type: integer
*         required:
*           - amount
*       - in: body
*         name: label
*         description: Unique label for the invoice
*         type: string
*         required:
*           - label
*       - in: body
*         name: description
*         description: Description for the invoice
*         type: string
*         required:
*           - description
*       - in: body
*         name: expiry
*         description: Expiry time period for the invoice (seconds)
*         type: integer
*       - in: body
*         name: private
*         description: Include routing hints for private channels (true or 1)
*         type: string
*       - in: body
*         name: fallbacks
*         description: The fallbacks array is one or more fallback addresses to include in the invoice (in order from most-preferred to least).
*         type: array
*         items:
*             type: string
*       - in: body
*         name: preimage
*         description: 64-digit hex string to be used as payment preimage for the created invoice. IMPORTANT> if you specify the preimage, you are responsible, to ensure appropriate care for generating using a secure pseudorandom generator seeded with sufficient entropy, and keeping the preimage secret. This parameter is an advanced feature intended for use with cutting-edge cryptographic protocols and should not be used unless explicitly needed.
*         type: string
*     security:
*       - MacaroonAuth: []
*     responses:
*       201:
*         description: OK
*         schema:
*           type: object
*           properties:
*             payment_hash:
*               type: string
*               description: payment_hash
*             expires_at:
*               type: integer
*               description: expires_at
*             bolt11:
*               type: string
*               description: bolt11
*       500:
*         description: Server error
*/
exports.genInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.invoice(
        msatoshi=((req.body.amount == 0) ? 'any' : req.body.amount),
        label=req.body.label,
        description=req.body.description,
        expiry=(req.body.expiry || null),
        fallbacks=(req.body.fallbacks || null),
        preimage=(req.body.preimage || null),
        exposeprivatechannels=(!!req.body.private || null)
    ).then(data => {
        global.logger.log('bolt11 -> '+ data.bolt11);
        global.logger.log('genInvoice success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listinvoice' command to list the invoices on the node
//Arguments - label [optional]
/**
* @swagger
* /invoice/listInvoices:
*   get:
*     tags:
*       - Invoice
*     name: listinvoices
*     summary: Returns the list of invoices
*     parameters:
*       - in: query
*         name: label
*         description: Invoice label
*         type: string
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: An array of invoices objects is returned
*         schema:
*           type: object
*           properties:
*             invoices:
*               type: object
*               properties:
*                 label:
*                   type: string
*                   description: label
*                 bolt11:
*                   type: string
*                   description: bolt11
*                 payment_hash:
*                   type: string
*                   description: payment_hash
*                 msatoshi:
*                   type: integer
*                   description: msatoshi
*                 amount_msat:
*                   type: number
*                   description: amount_msat
*                 status:
*                   type: string
*                   description: status
*                 pay_index:
*                   type: integer
*                   description: pay_index
*                 msatoshi_received:
*                   type: integer
*                   description: msatoshi_received
*                 amount_received_msat:
*                   type: number
*                   description: amount_received_msat
*                 paid_at:
*                   type: integer
*                   description: paid_at
*                 description:
*                   type: string
*                   description: description
*                 expires_at:
*                   type: integer
*                   description: expires_at
*               description: invoices
*       500:
*         description: Server error
*/
exports.listInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    if(req.query.label)
    {
        //var label = req.params.label;
        //Call the listinvoice command with label
        ln.listinvoices(req.query.label).then(data => {
            if(Object.keys(data.invoices).length)
                global.logger.log('bolt11 -> '+ data.invoices[0].bolt11);
            global.logger.log('listInvoice success');
            res.status(200).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
    }
    else
    {
        //Call the listinvoice command
        ln.listinvoices().then(data => {
            global.logger.log('Number of Invoices -> '+ Object.keys(data.invoices).length);
            global.logger.log('listInvoice success');
            res.status(200).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
    }
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'delexpiredinvoice' command to delete the expired invoices on the node
//Arguments - maxexpirytime [optional]
/**
* @swagger
* /invoice/delExpiredInvoice:
*   delete:
*     tags:
*       - Invoice
*     name: delexpiredinvoice
*     summary: Delete expired invoices
*     parameters:
*       - in: query
*         name: maxexpiry
*         description: Removes all invoices that have expired on or before maxexpiry
*         type: integer
*     security:
*       - MacaroonAuth: []
*     responses:
*       202:
*         description: Expired invoices deleted successfully
*       500:
*         description: Server error
*/
exports.delExpiredInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    if(req.query.maxexpiry)
    {
        //var maxexpiry = req.params.maxexpiry;
        //Call the delexpiredinvoice command with maxexpiry
        ln.delexpiredinvoice(req.query.maxexpiry).then(data => {
            res.status(202).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
    }
    else
    {
        //Call the delexpiredinvoice command
        ln.delexpiredinvoice().then(data => {
            global.logger.log('delExpiredInvoice success');
            res.status(202).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
    }
    ln.removeListener('error', connFailed);
}

//Function # 4
//Invoke the 'delinvoice' command to delete an invoice with a label and status
//Arguments - label (reqiured), status (required)
/**
* @swagger
* /invoice/delInvoice:
*   delete:
*     tags:
*       - Invoice
*     name: delinvoice
*     summary: Delete a particular invoice with a label and status
*     parameters:
*       - in: route
*         name: label
*         description: The unique label of the invoice
*         type: string
*         required:
*           - label
*       - in: route
*         name: status
*         description: The status of the invoice
*         type: string
*         required:
*           - status
*     security:
*       - MacaroonAuth: []
*     responses:
*       202:
*         description: Invoice deleted successfully
*       500:
*         description: Server error
*/
exports.delInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.delinvoice(req.params.label, req.params.status).then(data => {
        res.status(202).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}

//Function # 4
//Invoke the 'waitinvoice' command for waiting for specific payment
//Arguments - label (reqiured)
/**
* @swagger
* /invoice/waitInvoice:
*   get:
*     tags:
*       - Invoice
*     name: waitinvoice
*     summary: Waits until a specific invoice is paid, then returns that single entry as per listinvoice
*     parameters:
*       - in: route
*         name: label
*         description: The unique label of the invoice
*         type: string
*         required:
*           - label
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: On success, an object is returned
*         schema:
*           type: object
*           properties:
*             label:
*               type: string
*               description: unique label supplied at invoice creation
*             description:
*               type: string
*               description: description used in the invoice
*             payment_hash:
*               type: string
*               description: the hash of the payment_preimage which will prove payment (always 64 characters)
*             status:
*               type: string
*               description: Whether it's paid or expired (one of "paid", "expired")
*             expires_at:
*               type: string
*               description: UNIX timestamp of when it will become / became unpayable
*             amount_msat:
*               type: number
*               description: the amount required to pay this invoice
*             bolt11:
*               type: string
*               description: the BOLT11 string (always present unless bolt12 is)
*             bolt12:
*               type: string
*               description: the BOLT12 string (always present unless bolt11 is)
*             pay_index:
*               type: string
*               description: If status is "paid", unique incrementing index for this payment
*             amount_received_msat:
*               type: number
*               description: If status is "paid", the amount actually received
*             paid_at:
*               type: string
*               description: If status is "paid", UNIX timestamp of when it was paid
*             payment_preimage:
*               type: string
*               description: If status is "paid", proof of payment (always 64 characters)
*       500:
*         description: Server error
*/
exports.waitInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.waitinvoice(req.params.label).then(invoiceUpdate => {
        global.logger.log('Received Invoice Update: ' + JSON.stringify(invoiceUpdate));
        wsServer.broadcastToClients({event: 'waitinvoice', data: invoiceUpdate});
        res.status(200).json(invoiceUpdate);
    }).catch(err => {
        global.logger.warn(err);
        wsServer.broadcastToClients({event: 'waitinvoice', error: err});
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}

//Function # 5
//Invoke the 'waitanyinvoice' command for waiting for any invoice
//Arguments - lastPayIndex [required], timeout [optional]
/**
* @swagger
* /invoice/waitAnyInvoice:
*   get:
*     tags:
*       - Invoice
*     name: waitanyinvoice
*     summary: Waits until any invoice is paid, then returns that single entry as per listinvoice
*     parameters:
*       - in: route
*         name: lastPayIndex
*         description: The index of last paid invoice 
*         type: integer
*       - in: route
*         name: timeout
*         description: Timeout 
*         type: integer
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: On success, an object is returned
*         schema:
*           type: object
*           properties:
*             label:
*               type: string
*               description: unique label supplied at invoice creation
*             description:
*               type: string
*               description: description used in the invoice
*             payment_hash:
*               type: string
*               description: the hash of the payment_preimage which will prove payment (always 64 characters)
*             status:
*               type: string
*               description: Whether it's paid or expired (one of "paid", "expired")
*             expires_at:
*               type: string
*               description: UNIX timestamp of when it will become / became unpayable
*             amount_msat:
*               type: number
*               description: the amount required to pay this invoice
*             bolt11:
*               type: string
*               description: the BOLT11 string (always present unless bolt12 is)
*             bolt12:
*               type: string
*               description: the BOLT12 string (always present unless bolt11 is)
*             pay_index:
*               type: string
*               description: If status is "paid", unique incrementing index for this payment
*             amount_received_msat:
*               type: number
*               description: If status is "paid", the amount actually received
*             paid_at:
*               type: string
*               description: If status is "paid", UNIX timestamp of when it was paid
*             payment_preimage:
*               type: string
*               description: If status is "paid", proof of payment (always 64 characters)
*       500:
*         description: Server error
*/
exports.waitAnyInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.waitanyinvoice(req.params.lastPayIndex ? req.params.lastPayIndex : 0, req.params.timeout ? req.params.timeout : 60).then(invoicesUpdate => {
        global.logger.log('Received Any Invoice Update: ' + JSON.stringify(invoicesUpdate));
        wsServer.broadcastToClients({event: 'waitanyinvoice', data: invoicesUpdate});
        res.status(200).json(invoicesUpdate);
    }).catch(err => {
        global.logger.warn(err);
        wsServer.broadcastToClients({event: 'waitanyinvoice', error: err});
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}
