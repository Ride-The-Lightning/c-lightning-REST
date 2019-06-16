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
    ln.listpeers().then(data => {
        let chanData = {};
        data.peers.forEach(peer => {
            chanData = {};
            chanData = {
                peer_id: peer.id,
                connected: peer.connected,
                state: peer.channels[0].state,
                short_channel_id: peer.channels[0].short_channel_id,
                channel_id: peer.channels[0].channel_id,
                funding_txid: peer.channels[0].funding_txid,
                private: peer.channels[0].private,
                msatoshi_to_us: peer.channels[0].msatoshi_to_us,
                msatoshi_total: peer.channels[0].msatoshi_total,
                their_channel_reserve_satoshis: peer.channels[0].their_channel_reserve_satoshis,
                our_channel_reserve_satoshis: peer.channels[0].our_channel_reserve_satoshis,
                spendable_msatoshi: peer.channels[0].spendable_msatoshi
            };
            console.log('peer_id -> ' + chanData.peer_id);
            console.log('connected -> ' + chanData.connected);
            console.log('state -> ' + chanData.state);
            console.log('short_channel_id -> ' + chanData.short_channel_id);
            console.log('channel_id -> ' + chanData.channel_id);
            console.log('funding_txid -> ' + chanData.funding_txid);
            console.log('private -> ' + chanData.private);
            console.log('msatoshi_to_us -> ' + chanData.msatoshi_to_us);
            console.log('msatoshi_total -> ' + chanData.msatoshi_total);
            console.log('their_channel_reserve_satoshis -> ' + chanData.their_channel_reserve_satoshis);
            console.log('our_channel_reserve_satoshis -> ' + chanData.our_channel_reserve_satoshis);
            console.log('spendable_msatoshi -> ' + chanData.spendable_msatoshi);
            
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

exports.setChannelFee = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.id;
    var base = req.params.base;
    var ppm = req.params.ppm;
    ln.setchannelfee(id, base, ppm).then(data => {
        console.log('base -> '+ data.base);
        console.log('ppm -> '+ data.ppm);
        console.log('peer_id -> '+ data.peer_id);
        console.log('channel_id -> ' + data.channel_id);
        console.log('short_channel_id -> '+ data.short_channel_id);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('fundchannel success');
}

exports.closeChannel = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.id;
    var force = req.params.force;
    var timeout = req.params.timeout;
    ln.close(id,force,timeout).then(data => {
        res.status(202).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(403).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('closeChannel success');
}