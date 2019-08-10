//This controller will house all the payment functions

//Function # 1
//Invoke the 'pay' command to pay the bolt11 invoice passed with the argument
//This function has invoice as a mandatory argument
exports.payInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var invoice = req.params.invoice;
    
    //Call the pay command
    ln.pay(invoice).then(data => {
        console.log('id -> '+ data.id);
        console.log('payment_hash -> ' + data.payment_hash);
        console.log('destination -> ' + data.destination);
        console.log('msatoshi -> ' + data.msatoshi);
        console.log('msatoshi_sent -> ' + data.msatoshi_sent);
        console.log('status -> ' + data.status);
        console.log('payment_preimage -> ' + data.payment_preimage);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('payInvoice success');
}

//Function # 2
//Invoke the 'listpays' command to list all the payments attempted from the node
//No argument will returns all the invoices. Optional arugment is a specific bolt11 invoice
exports.listPays = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    if(req.params.invoice)
    {
        var invoice = req.params.invoice;
        //Call the listpays command with invoice
        ln.listpays(invoice).then(data => {
            console.log('bolt11 -> '+ data.pays[0].bolt11);
            console.log('status -> ' + data.pays[0].status);
            console.log('amount_sent_msat -> ' + data.pays[0].amount_sent_msat);
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(401).json(err);
        });
        ln.removeListener('error', connFailed);
    }
    else
    {
        //Call the listpays command without any argument
        ln.listpays().then(data => {
            console.log('Number of pays returned -> ' + Object.keys(data.pays).length);
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(401).json(err);
        });
        ln.removeListener('error', connFailed);
    }
    console.log('listPays success');
}

//Function # 3
//Invoke the 'listpayments' command to list all the payments attempted from the node
//No argument will returns all the invoices. Optional arugment is a specific bolt11 invoice
exports.listPayments = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    if(req.params.invoice)
    {
        var invoice = req.params.invoice;
        //Call the listpayments command with invoice
        ln.listpayments(invoice).then(data => {
            console.log('id -> ' + data.payments[0].id);
            console.log('payment_hash -> ' + data.payments[0].payment_hash);
            console.log('destination -> ' + data.payments[0].destination);
            console.log('msatoshi -> ' + data.payments[0].msatoshi);
            console.log('status -> ' + data.payments[0].status);
            console.log('amount_sent_msat -> ' + data.payments[0].amount_sent_msat);
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(401).json(err);
        });
        ln.removeListener('error', connFailed);
    }
    else
    {
        //Call the listpayments command without any argument
        ln.listpayments().then(data => {
            console.log('Number of payments returned -> ' + Object.keys(data.payments).length);
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(401).json(err);
        });
        ln.removeListener('error', connFailed);
    }
    console.log('listPayments success');
}