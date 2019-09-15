//This controller houses all the invoice functions

//Function # 1
//Invoke the 'invoice' command to generate a bolt11 invoice
//Arguments - Amount in msat [required], label [required], description [required], expiry in seconds [optional]
exports.genInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var amount = req.body.amount;
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