exports.openChannel = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.pubKey;
    var satoshis = req.params.sats;
    ln.fundchannel(id, satoshis).then(data => {
        console.log('tx -> '+ data.tx);
        console.log('txid -> '+ data.txid);
        console.log('channel_id -> ' + data.channel_id);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('fundchannel success');
}