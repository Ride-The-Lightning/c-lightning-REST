//This controller houses all the channel functions

//Function # 1
//Invoke the 'fundchannel' command to open a channel with a peer
//Arguments - Pub key (required), Amount in sats (required)
exports.openChannel = (req,res) => {
    global.logger.log('fundchannel initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var id = req.body.id;
    var satoshis = req.body.satoshis;
    //Set optional params
    var feerate = (req.body.feeRate) ? req.body.feeRate : null;
    var announce = (req.body.announce === '0' || req.body.announce === 'false') ? !!req.body.announce : null;
    var minconf = (req.body.minConf) ? req.body.minConf : null;
    var utxos = null; //currently not supported in this api
    
    //Call the fundchannel command with the pub key and amount specified
    ln.fundchannel(id=id,
        satoshi=satoshis,
        feerate=feerate,
        announce=announce,
        minconf=minconf,
        utxos=utxos).then(data => {
        global.logger.log('fundchannel success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listpeers' command get the list of channels
//Arguments - No arguments
exports.listChannels = (req,res) => {
    global.logger.log('listChannels initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listpeers command
    ln.listpeers().then(data => {
        const filteredPeers = data.peers.filter(peer => peer.channels.length > 0);
        Promise.all(
        filteredPeers.map(peer => {
            chanData = {};
            chanData = {
                id: peer.id,
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
            return getAliasForPeer(chanData);
        })
        ).then(function(chanList) {
            global.logger.log('listChannels success');
            res.status(200).json(chanList);
        }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'setchannelfee' command update the fee policy of a channel
//Arguments - Channel id (required), Base rate (optional), PPM rate (optional)
exports.setChannelFee = (req,res) => {
    global.logger.log('setChannelfee initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var id = req.body.id;
    //Set optional params
    var base = (req.body.base) ? req.body.base : null;
    var ppm = (req.body.ppm) ? req.body.ppm : null;

    //Call the setchannelfee command with the params
    ln.setchannelfee(id, base, ppm).then(data => {
        global.logger.log('setChannelfee success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 4
//Invoke the 'close' command to close a channel
//Arguments - Channel id (required),  Unilateral Timeout in seconds (optional)
exports.closeChannel = (req,res) => {
    global.logger.log('closeChannel initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.id;
    if(req.query.unilateraltimeout)
        var unilaterlaltimeout = req.query.unilateralTimeout;
    else
        var unilaterlaltimeout = 0;

    //Call the close command with the params
    ln.close(id,unilaterlaltimeout).then(data => {
        global.logger.log('closeChannel success');
        res.status(202).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 5
//Invoke the 'listforwards' command to list the forwarded htlcs
//Arguments - None
exports.listForwards = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listforwards command
    ln.listforwards().then(data => {
        global.logger.log('listforwards success');
        res.status(200).json(data.forwards);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function to fetch the alias for peer
getAliasForPeer = (peer) => {
    return new Promise(function(resolve, reject) {
        ln.listnodes(peer.id).then(data => {
            peer.alias = data.nodes[0] ? data.nodes[0].alias : '';
            resolve(peer);
        }).catch(err => {
            global.logger.warn('Node lookup for getpeer failed\n');
            global.logger.warn(err);
            peer.alias = '';
            resolve(peer);
        });
    });
  }