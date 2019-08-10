exports.payInvoice = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var invoice = req.params.invoice;
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