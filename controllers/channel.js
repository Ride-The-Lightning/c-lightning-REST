//This controller houses all the channel functions

//Function # 1
//Invoke the 'fundchannel' command to open a channel with a peer
//Arguments - Pub key (required), Amount in sats (required)
exports.openChannel = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.pubKey;
    var satoshis = req.params.sats;

    //Call the fundchannel command with the pub key and amount specified
    ln.fundchannel(id, satoshis).then(data => {
        console.log('tx -> '+ data.tx);
        console.log('txid -> '+ data.txid);
        console.log('channel_id -> ' + data.channel_id);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });

    ln.removeListener('error', connFailed);
    console.log('fundchannel success');
}

//Function # 2
//Invoke the 'listpeers' command get the list of channels
//Arguments - No arguments
exports.listChannels = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    const chanList = [];

    //Call the listpeers command
    ln.listpeers().then(data => {
        let chanData = {};
        data.peers.forEach(peer => {
            chanData = {};
            if (Object.keys(peer.channels).length) {
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
            chanList.push(chanData);
        }
        });

        res.status(200).json(chanList);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });

    ln.removeListener('error', connFailed);
    console.log('listChannels success');
}

//Function # 3
//Invoke the 'setchannelfee' command update the fee policy of a channel
//Arguments - Channel id (required), Base rate (optional), PPM rate (optional)
exports.setChannelFee = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.id;
    var base = req.params.base;
    var ppm = req.params.ppm;

    //Call the setchannelfee command with the params
    ln.setchannelfee(id, base, ppm).then(data => {
        console.log('base -> '+ data.base);
        console.log('ppm -> '+ data.ppm);
        console.log('peer_id -> '+ data.peer_id);
        console.log('channel_id -> ' + data.channel_id);
        console.log('short_channel_id -> '+ data.short_channel_id);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('fundchannel success');
}

//Function # 4
//Invoke the 'close' command to close a channel
//Arguments - Channel id (required), Force flag (optional), Timeout in seconds (optional)
exports.closeChannel = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.id;
    var force = req.params.force;
    var timeout = req.params.timeout;

    //Call the close command with the params
    ln.close(id,force,timeout).then(data => {
        res.status(202).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });

    ln.removeListener('error', connFailed);
    console.log('closeChannel success');
}