//This controller houses all the payment functions

//Function # 1
//Invoke the 'pay' command to pay the bolt11 invoice passed with the argument
//Arguments - Bolt11 Invoice [required]
/**
* @swagger
* /pay:
*   post:
*     tags:
*       - Payments
*     name: pay
*     summary: Pay a BOLT11 invoice
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: invoice
*         description: BOLT11 invoice
*         type: string
*         required:
*           - invoice
*       - in: body
*         name: amount
*         description: Amount in milli satoshis
*         type: integer
*       - in: body
*         name: maxfeepercent
*         description: Fraction of the amount to be paid as fee
*         type: integer
*     responses:
*       201:
*         description: OK
*         schema:
*           type: object
*           properties:
*             id:
*               type: integer
*               description: id
*             payment_hash:
*               type: string
*               description: payment_hash
*             destination:
*               type: string
*               description: destination
*             msatoshi:
*               type: integer
*               description: msatoshi
*             amount_msat:
*               type: string
*               description: amount_msat
*             msatoshi_sent:
*               type: integer
*               description: msatoshi_sent
*             amount_sent_msat:
*               type: string
*               description: amount_sent_msat
*             created_at:
*               type: integer
*               description: created_at
*             status:
*               type: string
*               description: status
*             payment_preimage:
*               type: string
*               description: payment_preimage
*             bolt11:
*               type: string
*               description: bolt11
*       500:
*         description: Server error
*         schema:
*           type: object
*           properties:
*             type:
*               type: string
*               description: type
*             name:
*               type: string
*               description: name
*             message:
*               type: string
*               description: message
*             code:
*               type: integer
*               description: code
*             fullType:
*               type: string
*               description: fullType
*/
exports.payInvoice = (req,res) => {
    global.logger.log('pay initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var invoice = req.body.invoice;
    //Set optional params
    var msatoshi = (req.body.amount) ? req.body.amount : null;
    var maxfeepercent = (req.body.maxfeepercent) ? req.body.maxfeepercent : null;
    //Optional params not exposed via the API
    var label = null;
    var riskfactor = null;
    var retry_for = null;
    var maxdelay = null;
    var exemptfee = null;

    //Call the pay command
    ln.pay(bolt11=invoice,
        msatoshi=msatoshi,
        label=label,
        riskfactor=riskfactor,
        maxfeepercent=maxfeepercent,
        retry_for=retry_for,
        maxdelay = maxdelay,
        exemptfee=exemptfee).then(data => {
        global.logger.log('pay invoice success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listpays' command to list all the payments attempted from the node
//Arguments - Bolt11 invoice [optional]
/**
* @swagger
* /pay/listPays:
*   get:
*     tags:
*       - Payments
*     name: listpays
*     summary: Returns a list of payments
*     parameters:
*       - in: query
*         name: invoice
*         description: BOLT11 invoice
*         type: string
*     responses:
*       200:
*         description: An array of pays objects is returned
*         schema:
*           type: object
*           properties:
*             pays:
*               type: object
*               properties:
*                 bolt11:
*                   type: string
*                   description: bolt11
*                 status:
*                   type: string
*                   description: status
*                 payment_preimage:
*                   type: string
*                   description: payment_preimage
*                 amount_sent_msat:
*                   type: string
*                   description: amount_sent_msat
*               description: pays
*       500:
*         description: Server error
*/
exports.listPays = (req,res) => {
    global.logger.log('listPays initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    if(req.query.invoice)
    {
        var invoice = req.query.invoice;
        //Call the listpays command with invoice
        ln.listpays(invoice).then(data => {
            global.logger.log('listPays success');
            res.status(200).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
    else
    {
        //Call the listpays command without any argument
        ln.listpays().then(data => {
            global.logger.log('listPays success');
            res.status(200).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
}

//Function # 3
//Invoke the 'listpayments' command to list all the payments attempted from the node
//Arguments - Bolt11 invoice [optional]
/**
* @swagger
* /pay/listPayments:
*   get:
*     tags:
*       - Payments
*     name: listpayments
*     summary: Returns a detailed list of payments
*     parameters:
*       - in: query
*         name: invoice
*         description: BOLT11 invoice
*         type: string
*     responses:
*       200:
*         description: An array of payments objects is returned
*         schema:
*           type: object
*           properties:
*             payments:
*               type: object
*               properties:
*                 id:
*                   type: integer
*                   description: id
*                 payment_hash:
*                   type: string
*                   description: payment_hash
*                 destination:
*                   type: string
*                   description: destination
*                 msatoshi:
*                   type: integer
*                   description: msatoshi
*                 amount_msat:
*                   type: string
*                   description: amount_msat
*                 msatoshi_sent:
*                   type: integer
*                   description: msatoshi_sent
*                 amount_sent_msat:
*                   type: string
*                   description: amount_sent_msat
*                 created_at:
*                   type: integer
*                   description: created_at
*                 status:
*                   type: string
*                   description: status
*                 payment_preimage:
*                   type: string
*                   description: payment_preimage
*                 bolt11:
*                   type: string
*                   description: bolt11
*               description: payments
*       500:
*         description: Server error
*/
exports.listPayments = (req,res) => {
    global.logger.log('listPayments initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    if(req.query.invoice)
    {
        var invoice = req.query.invoice;
        //Call the listpayments command with invoice
        ln.listsendpays(invoice).then(data => {
            global.logger.log('listsendpays success');
            res.status(200).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
    else
    {
        //Call the listpayments command without any argument
        ln.listsendpays().then(data => {
            global.logger.log('listsendpays success');
            res.status(200).json(data);
        }).catch(err => {
            global.logger.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
}

//Function # 4
//Invoke the 'decodepay' command to decode a bolt11 invoice
//Arguments - Bolt11 invoice [required]
exports.decodePay = (req,res) => {
    global.logger.log('decodePay initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    var invoice = req.params.invoice;
    //Call the decodepay command
    ln.decodepay(invoice).then(data => {
        global.logger.log('decodePay success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}