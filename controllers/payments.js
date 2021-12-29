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
*         name: label
*         description: Label for the payment
*         type: string
*       - in: body
*         name: riskfactor
*         description: Annual cost of your funds being stuck (as a percentage)
*         type: number
*         format: double
*       - in: body
*         name: maxfeepercent
*         description: Fraction of the amount to be paid as fee (as a percentage)
*         type: number
*         format: double
*       - in: body
*         name: retry_for
*         description: Keep retryinig to find routes for this long (seconds)
*         type: integer
*       - in: body
*         name: maxdelay
*         description: The payment can be delayed for more than this many blocks
*         type: integer
*       - in: body
*         name: exemptfee
*         description: Amount for which the maxfeepercent check is skipped
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
    var label = (req.body.label) ? req.body.label : null;
    var riskfactor = (req.body.riskfactor) ? req.body.riskfactor : null;
    var maxfeepercent = (req.body.maxfeepercent) ? req.body.maxfeepercent : null;
    var retry_for = (req.body.retry_for) ? req.body.retry_for : null;
    var maxdelay = (req.body.maxdelay) ? req.body.maxdelay : null;
    var exemptfee = (req.body.exemptfee) ? req.body.exemptfee : null;

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
*                   description: preimage
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
*                 memo:
*                   type: string
*                   description: memo
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
        Promise.all(
            data.payments.map(payment => {
                var paymentsData = {
                    id: payment.id,
                    payment_hash: payment.payment_hash,
                    msatoshi: payment.msatoshi,
                    amount_msat: payment.amount_msat,
                    msatoshi_sent: payment.msatoshi_sent,
                    amount_sent_msat: payment.amount_sent_msat,
                    created_at: payment.created_at,
                    status: payment.status,
                    //payment_preimage: payment.payment_preimage
                };
                //For handling keysend records with no bolt11 in the data
                if (payment.bolt11) {
                    paymentsData.bolt11 = payment.bolt11;
                }
                //For handling partid in case of MPP
                if (payment.partid) {
                    paymentsData.partid = payment.partid;
                }
                //To handle a release bug, with missing destination value in the data
                if (payment.destination) {
                    paymentsData.destination = payment.destination;
                }
                //Add bolt12 if available
                if (payment.bolt12) {
                    paymentsData.bolt12 = payment.bolt12;
                }
                //Handle status scenarios
                if (payment.status == "complete") {
                    paymentsData.payment_preimage = payment.payment_preimage;
                }
                if(payment.status == "failed") {
                    paymentsData.erroronion = payment.erroronion;
                }
                //Handle label
                if(payment.label) {
                    paymentsData.label = payment.label;
                }
                
                return getMemoForPayment(paymentsData);
            })
            ).then(function(paymentsList) {
                global.logger.log('listpayments success');
                res.status(200).json({payments: paymentsList});
            }).catch(err => {
                global.logger.warn(err);
                res.status(500).json({error: err});
            });
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
/**
* @swagger
* /pay/decodePay:
*   get:
*     tags:
*       - Payments
*     name: decodepay
*     summary: Decode the bolt11 invoice
*     parameters:
*       - in: route
*         name: invoice
*         description: BOLT11 invoice
*         type: string
*         required:
*           - invoice
*     responses:
*       200:
*         description: A decoded invoice object is returned
*         schema:
*             type: object
*             properties:
*               currency:
*                 type: string
*                 description: The BIP173 name for the currency
*               created_at:
*                 type: integer
*                 description: Creation timestamp UNIX style
*               expiry:
*                 type: integer
*                 description: The number of seconds this is valid after creation timestamp
*               payee:
*                 type: string
*                 description: The pubkey of the recipient
*               msatoshi:
*                 type: integer
*                 description: The number of msats requested
*               amount_msat:
*                 type: string
*                 description: The number of msats in string with 'msat' appended
*               description:
*                 type: string
*                 description: Invoice description
*               min_final_cltv_expiry:
*                 type: integer
*                 description: min_final_cltv_expiry
*               payment_secret:
*                 type: string
*                 description: payment_secret
*               features:
*                 type: string
*                 description: features
*               routes:
*                 type: object
*                 description: routes
*               payment_hash:
*                 type: string
*                 description: payment_hash
*               signature:
*                 type: string
*                 description: signature
*       500:
*         description: Server error
*/
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

//Function # 5
//Invoke the 'keysend' command to send funds to a node without an invoice
//Arguments - Pubkey [required], Amount [required]
/**
* @swagger
* /pay/keysend:
*   post:
*     tags:
*       - Payments
*     name: keysend
*     summary: Send funds to a node without an invoice
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: pubkey
*         description: 33 byte, hex-encoded, pubkey of the node
*         type: string
*         required:
*           - pubkey
*       - in: body
*         name: amount
*         description: Amount in milli satoshis
*         type: integer
*         required:
*           - amount
*       - in: body
*         name: label
*         description: Label for the payment
*         type: string
*       - in: body
*         name: maxfeepercent
*         description: Fraction of the amount to be paid as fee (as a percentage)
*         type: number
*         format: double
*       - in: body
*         name: retry_for
*         description: Keep retryinig to find routes for this long (seconds)
*         type: integer
*       - in: body
*         name: maxdelay
*         description: The payment can be delayed for more than this many blocks
*         type: integer
*       - in: body
*         name: exemptfee
*         description: Amount for which the maxfeepercent check is skipped
*         type: integer
*     responses:
*       201:
*         description: OK
*         schema:
*           type: object
*           properties:
*             destination:
*               type: string
*               description: destination
*             payment_hash:
*               type: string
*               description: payment_hash
*             created_at:
*               type: integer
*               description: created_at
*             parts:
*               type: integer
*               description: parts
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
*             payment_preimage:
*               type: string
*               description: payment_preimage
*             status:
*               type: string
*               description: status
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
exports.keysend = (req,res) => {
    global.logger.log('keysend initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var dest = req.body.pubkey;
    var amount_msat = req.body.amount;
    //Set optional params
    var label = (req.body.label) ? req.body.label : null;
    var maxfeepercent = (req.body.maxfeepercent) ? req.body.maxfeepercent : null;
    var retry_for = (req.body.retry_for) ? req.body.retry_for : null;
    var maxdelay = (req.body.maxdelay) ? req.body.maxdelay : null;
    var exemptfee = (req.body.exemptfee) ? req.body.exemptfee : null;

    //Call the keysend command
    ln.keysend(destination=dest,
        msatoshi=amount_msat,
        label=label,
        maxfeepercent=maxfeepercent,
        retry_for=retry_for,
        maxdelay = maxdelay,
        exemptfee=exemptfee).then(data => {
        global.logger.log('keysend successful');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function to memo for the payment
getMemoForPayment = (payment) => {
    return new Promise(function(resolve, reject) {
    if(payment.bolt11){
        ln.decodepay(payment.bolt11).then(data => {
                if(data.description)
                    payment.memo = data.description;
            resolve(payment);
            }).catch(err => {
            global.logger.warn('Memo lookup for payment failed\n');
            global.logger.warn(err);
            payment.memo = '';
            resolve(payment);
        });
    }
    else{
        payment.memo = '';
        resolve(payment);
    }
    });
  }