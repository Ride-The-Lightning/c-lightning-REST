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
*       - in: query
*         name: expiry
*         description: Expiry time period for the invoice (seconds)
*         type: integer
*       - in: query
*         name: private
*         description: Include routing hints for private channels (true or 1)
*         type: string
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
    //Set required params
    var amount = req.body.amount;
    if(req.body.amount == 0)
        amount = 'any';
    var label = req.body.label;
    var desc = req.body.description;
    //Set optional params
    var expiry = (req.body.expiry) ? req.body.expiry : null;
    var exposePvt = (req.body.private === '1' || req.body.private === 'true') ? !!req.body.private : null;
    //Set unexposed params
    var fallback = null;
    var preimage = null;

    ln.invoice(msatoshi=amount,
    label=label,
    description=desc,
    expiry=expiry,
    fallback=fallback,
    preimage=preimage,
    exposeprivatechannels=exposePvt).then(data => {
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
*                   type: string
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
*                   type: string
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
*               type: string
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
*               type: string
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

    ln.waitinvoice(req.params.label).then(data => {
        global.logger.log('waitInvoice successful');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}