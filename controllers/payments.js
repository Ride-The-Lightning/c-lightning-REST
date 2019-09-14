//This controller houses all the payment functions

//Function # 1
//Invoke the 'pay' command to pay the bolt11 invoice passed with the argument
//Arguments - Bolt11 Invoice [required]
exports.payInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var invoice = req.body.invoice;
    //Set optional params
    var msatoshi = (req.body.amount) ? req.body.amount : null;
    //Optional params not exposed via the API
    var label = null;
    var riskfactor = null;
    var maxfeepercent = null;
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
        console.log('pay invoice success');
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listpays' command to list all the payments attempted from the node
//Arguments - Bolt11 invoice [optional]
exports.listPays = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    if(req.query.invoice)
    {
        var invoice = req.query.invoice;
        //Call the listpays command with invoice
        ln.listpays(invoice).then(data => {
            console.log('listPays success');
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
    else
    {
        //Call the listpays command without any argument
        ln.listpays().then(data => {
            console.log('listPays success');
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
}

//Function # 3
//Invoke the 'listpayments' command to list all the payments attempted from the node
//Arguments - Bolt11 invoice [optional]
exports.listPayments = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    if(req.query.invoice)
    {
        var invoice = req.query.invoice;
        //Call the listpayments command with invoice
        ln.listpayments(invoice).then(data => {
            console.log('listPayments success');
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
    else
    {
        //Call the listpayments command without any argument
        ln.listpayments().then(data => {
            console.log('listPayments success');
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(500).json({error: err});
        });
        ln.removeListener('error', connFailed);
    }
}

//Function # 4
//Invoke the 'decodepay' command to decode a bolt11 invoice
//Arguments - Bolt11 invoice [required]
exports.decodePay = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    var invoice = req.params.invoice;
    //Call the decodepay command
    ln.decodepay(invoice).then(data => {
        console.log('decodePay success');
        res.status(200).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}