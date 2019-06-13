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

exports.getChannels = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    const chanList = [];
    ln.listfunds().then(data => {
        let chanData = {};
        data.channels.forEach(channels => {
            chanData = {};
            chanData = {
                peer_id: channels.peer_id,
                short_channel_id: channels.short_channel_id,
                channel_sat: channels.channel_sat,
                our_amount_msat: channels.our_amount_msat,
                channel_total_sat: channels.channel_total_sat,
                amount_msat: channels.amount_msat,
                funding_txid: channels.funding_txid
            };
            console.log('peer_id -> ' + chanData.peer_id);
            console.log('short_channel_id -> ' + chanData.short_channel_id);
            console.log('channel_sat -> ' + chanData.channel_sat);
            console.log('our_amount_msat -> ' + chanData.our_amount_msat);
            console.log('channel_total_sat -> ' + chanData.channel_total_sat);
            console.log('amount_msat -> ' + chanData.amount_msat);
            console.log('funding_txid -> ' + chanData.funding_txid);
            chanList.push(chanData);
        });

        res.status(200).json(chanList);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('getChannels success');
}