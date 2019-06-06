exports.withdraw = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var address = req.params.addr;
    var satoshis = req.params.sats;
    ln.withdraw(address, satoshis).then(data => {
        console.log('tx -> '+ data.tx);
        console.log('txid -> '+ data.txid);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('withdraw success');
}