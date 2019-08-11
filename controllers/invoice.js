//This controller houses all the invoice functions

//Function # 1
//Invoke the 'invoice' command to generate a bolt11 invoice
//Arguments - Amount in msat [required], label [required], description [required], expiry in seconds [optional]
exports.genInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var amount = req.params.amount;
    var label = req.params.label;
    var desc = req.params.desc;

    if(req.params.expiry)
    {
        var expiry = req.params.expiry;
        //Call the invoice command with expiry
        ln.invoice(amount, label, desc, expiry).then(data => {
            console.log('bolt11 -> '+ data.bolt11);
            res.status(201).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(402).json(err);
        });
    }
    else
    {
        //Call the invoice command
        ln.invoice(amount, label, desc).then(data => {
            console.log('bolt11 -> '+ data.bolt11);
            res.status(201).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(402).json(err);
        });
    }

    ln.removeListener('error', connFailed);
    console.log('genInvoice success');
}

//Function # 2
//Invoke the 'listinvoice' command to list the invoices on the node
//Arguments - label [optional]
exports.listInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    if(req.params.label)
    {
        var label = req.params.label;
        //Call the listinvoice command with label
        ln.listinvoices(label).then(data => {
            if(Object.keys(data.invoices).length)
                console.log('bolt11 -> '+ data.invoices[0].bolt11);
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(401).json(err);
        });
    }
    else
    {
        //Call the listinvoice command
        ln.listinvoices().then(data => {
            console.log('Number of Invoices -> '+ Object.keys(data.invoices).length);
            res.status(200).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(401).json(err);
        });
    }

    ln.removeListener('error', connFailed);
    console.log('listInvoice success');
}

//Function # 3
//Invoke the 'delexpiredinvoice' command to delete the expired invoices on the node
//Arguments - maxexpirytime [optional]
exports.delExpiredInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    if(req.params.maxexpiry)
    {
        var maxexpiry = req.params.maxexpiry;
        //Call the delexpiredinvoice command with maxexpiry
        ln.delexpiredinvoice(maxexpiry).then(data => {
            res.status(202).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(403).json(err);
        });
    }
    else
    {
        //Call the delexpiredinvoice command
        ln.delexpiredinvoice().then(data => {
            res.status(202).json(data);
        }).catch(err => {
            console.warn(err);
            res.status(403).json(err);
        });
    }

    ln.removeListener('error', connFailed);
    console.log('delExpiredInvoice success');
}