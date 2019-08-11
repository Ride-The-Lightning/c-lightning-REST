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