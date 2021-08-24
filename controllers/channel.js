//This controller houses all the channel functions

//Function # 1
//Invoke the 'fundchannel' command to open a channel with a peer
//Arguments - Pub key (required), Amount in sats (required)
/**
* @swagger
* /channel/openChannel:
*   post:
*     tags:
*       - Channel Management
*     name: fundchannel
*     summary: Opens channel with a network peer
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: id
*         description: Pub key of the peer
*         type: string
*         required:
*           - id
*       - in: body
*         name: satoshis
*         description: Amount in satoshis
*         type: string
*         required:
*           - satoshis
*       - in: body
*         name: feerate
*         description: urgent, normal, slow
*         type: string
*         default: normal
*       - in: body
*         name: announce
*         description: Flag to announce the channel (true, false)
*         type: string
*         default: true
*       - in: body
*         name: minConf
*         description: Minimum number of confirmations that used outputs should have
*         type: integer
*         default: 1
*       - in: body
*         name: utxos
*         description: Specifies the utxos to be used to fund the channel, as an array of "txid:vout"
*         type: array
*         items: string
*     responses:
*       201:
*         description: OK
*         schema:
*           type: object
*           properties:
*             tx:
*               type: string
*               description: Transaction
*             txid:
*               type: string
*               description: Transaction ID
*             channel_id:
*               type: string
*               description: channel_id of the newly created channel
*       500:
*         description: Server error
*/
exports.openChannel = (req,res) => {
    global.logger.log('fundchannel initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var id = req.body.id;
    var satoshis = req.body.satoshis;
    //Set optional params
    var feerate = (req.body.feeRate) ? req.body.feeRate : null;
    var announce = (req.body.announce === '0' || req.body.announce === 'false' || !req.body.announce) ? false : true;
    var minconf = (req.body.minConf) ? req.body.minConf : null;
    var utxos = (req.body.utxos) ? req.body.utxos : null; //coin selection

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
/**
* @swagger
* /channel/listChannels:
*   get:
*     tags:
*       - Channel Management
*     name: listchannel
*     summary: Returns a list of channels on the node
*     responses:
*       200:
*         description: An array of channels is returned
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*               description: Pub key
*             connected:
*               type: string
*               description: Peer connection status (true or false)
*             state:
*               type: string
*               description: Channel connection status
*             short_channel_id:
*               type: string
*               description: Channel ID
*             channel_id:
*               type: string
*               description: Channel ID
*             funding_txid:
*               type: string
*               description: Channel funding transaction
*             private:
*               type: string
*               description: Private channel flag (true or false)
*             msatoshi_to_us:
*               type: string
*               description: msatoshi_to_us
*             msatoshi_total:
*               type: string
*               description: msatoshi_total
*             msatoshi_to_them:
*               type: string
*               description: msatoshi_to_them
*             their_channel_reserve_satoshis:
*               type: string
*               description: their_channel_reserve_satoshis
*             our_channel_reserve_satoshis:
*               type: string
*               description: our_channel_reserve_satoshis
*             spendable_msatoshi:
*               type: string
*               description: spendable_msatoshi
*             funding_allocation_msat:
*               type: object
*               additionalProperties:
*                 type: integer 
*               description: funding_allocation_msat
*             direction:
*               type: integer
*               description: Flag indicating if this peer initiated the channel (0,1)
*             alias:
*               type: string
*               description: Alias of the node
*       500:
*         description: Server error
*/
exports.listChannels = (req,res) => {
    global.logger.log('listChannels channel initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listpeers command
    ln.listpeers().then(data => {
        const filteredPeers = data.peers.filter(peer => peer.channels.length > 0);
        Promise.all(
        filteredPeers.map(peer => {
            // look for a channel that isn't closed already
            const openChan = peer.channels.find(c => c.state !== 'ONCHAIN' && c.state !== 'CLOSED');
            // use the open channel if found, otherwise use the first channel
            const chan = openChan || peer.channels[0];
            var chanData = {
                id: peer.id,
                connected: peer.connected,
                state: chan.state,
                short_channel_id: chan.short_channel_id,
                channel_id: chan.channel_id,
                funding_txid: chan.funding_txid,
                private: chan.private,
                msatoshi_to_us: chan.msatoshi_to_us,
                msatoshi_total: chan.msatoshi_total,
                msatoshi_to_them: chan.msatoshi_total - chan.msatoshi_to_us,
                their_channel_reserve_satoshis: chan.their_channel_reserve_satoshis,
                our_channel_reserve_satoshis: chan.our_channel_reserve_satoshis,
                spendable_msatoshi: chan.spendable_msatoshi,
                funding_allocation_msat: chan.funding_allocation_msat
            };
            if (chan.direction === 0 || chan.direction === 1) {
                chanData.direction = chan.direction;
            }
            return getAliasForPeer(chanData);
        })
        ).then(function(chanList) {
            global.logger.log('listChannels channel success');
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
/**
* @swagger
* /channel/setChannelFee:
*   post:
*     tags:
*       - Channel Management
*     name: setchannelfee
*     summary: Update channel fee policy
*     parameters:
*       - in: body
*         name: id
*         description: Short channel ID or channel id. It can be "all" for updating all channels
*         type: string
*         required:
*           - id
*       - in: body
*         name: base
*         description: Optional value in msats added as base fee to any routed payment
*         type: integer
*       - in: body
*         name: ppm
*         description: Optional value that is added proportionally per-millionths to any routed payment volume in satoshi
*         type: integer
*     responses:
*       201:
*         description: channel fee updated successfully
*         schema:
*           type: object
*           properties:
*             base:
*               type: string
*               description: base
*             ppm:
*               type: string
*               description: ppm
*             peer_id:
*               type: string
*               description: peer_id
*             channel_id:
*               type: string
*               description: channel_id
*             short_channel_id:
*               type: string
*               description: short_channel_id
*       500:
*         description: Server error
*/
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
    global.logger.log(req.body);
    ln.setchannelfee(id, base, ppm).then(data => {
        global.logger.log('setChannelfee success');
        global.logger.log(data);
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
/**
* @swagger
* /channel/closeChannel:
*   delete:
*     tags:
*       - Channel Management
*     name: close
*     summary: Close an existing channel with a peer
*     parameters:
*       - in: route
*         name: id
*         description: Short channel ID or channel id
*         type: string
*         required:
*           - id
*       - in: query
*         name: unilateralTimeout
*         description: Unit is Seconds. For non-zero values, close command will unilaterally close the channel when that number of seconds is reached
*         type: integer
*         default: 172800
*       - in: query
*         name: dest
*         description: The destination can be of any Bitcoin accepted type address, including bech32.
*         type: string
*       - in: query
*         name: feeNegotiationStep
*         description: The fee negotiation step parameter controls how closing fee negotiation is performed.
*         type: string
*     responses:
*       202:
*         description: channel closed successfully
*         schema:
*           type: object
*           properties:
*             tx:
*               type: string
*               description: Transaction
*             txid:
*               type: string
*               description: Transaction ID
*             type:
*               type: string
*               description: type
*       500:
*         description: Server error
*/
exports.closeChannel = (req,res) => {
    global.logger.log('closeChannel initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var id = req.params.id;

    //optional params
    if(req.query['unilateralTimeout'])
        var unilaterlaltimeout = req.query['unilateralTimeout'];
    else
        var unilaterlaltimeout = 0;
    var dest = (req.query['dest']) ? req.query['dest'] : null;
    var feeNegStep = (req.query['feeNegotiationStep']) ? req.query['feeNegotiationStep'] : null;

    //Call the close command with the params
    ln.close(id=id,
        unilaterlaltimeout=unilaterlaltimeout,
        destination=dest,
        fee_negotiation_step=feeNegStep).then(data => {
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
/**
* @swagger
* /channel/listForwards:
*   get:
*     tags:
*       - Channel Management
*     name: listforwards
*     summary: Fetch the list of the forwarded htlcs
*     responses:
*       200:
*         description: channel closed successfully
*         schema:
*           type: object
*           properties:
*             in_channel:
*               type: string
*               description: in_channel
*             out_channel:
*               type: string
*               description: out_channel
*             in_msatoshi:
*               type: string
*               description: in_msatoshi
*             in_msat:
*               type: string
*               description: in_msat
*             out_msatoshi:
*               type: string
*               description: out_msatoshi
*             out_msat:
*               type: string
*               description: out_msat
*             fee:
*               type: string
*               description: fee
*             fee_msat:
*               type: string
*               description: fee_msat
*       500:
*         description: Server error
*/
exports.listForwards = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var {offset, maxLen, reverse} = req.query
    //Call the listforwards command
    ln.listforwards().then(data => {
        var forwards = data.forwards
        if(!offset) {
            offset = 0;
        }
        offset = parseInt(offset)
        if(!maxLen) {
            maxLen = forwards.length - offset
        }
        maxLen = parseInt(maxLen)
        if(!reverse) {
            reverse = false
        }
        reverse = !(reverse === 'false' || reverse === false)
        var fill = [];
        if(reverse === true && offset>=0) {
            for(let i=Math.min(offset, forwards.length - 1); i >= Math.max(0, (offset-maxLen)+1); i--) {
                    fill.push(forwards[i])
            }
        } else if(reverse === false) {
            fill = forwards.slice(Math.max(offset, 0), Math.min(offset + maxLen, forwards.length))
        }
        global.logger.log('listforwards success');
        res.status(200).json(fill);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}


//Function # 5
//Invoke the 'listforwards' command to list the forwarded htlcs
//Arguments - None
/**
* @swagger
* /channel/listForwards:
*   get:
*     tags:
*       - Channel Management
*     name: listforwards
*     summary: Fetch the list of the forwarded htlcs
*     responses:
*       200:
*         description: channel closed successfully
*         schema:
*           type: object
*           properties:
*             in_channel:
*               type: string
*               description: in_channel
*             out_channel:
*               type: string
*               description: out_channel
*             in_msatoshi:
*               type: string
*               description: in_msatoshi
*             in_msat:
*               type: string
*               description: in_msat
*             out_msatoshi:
*               type: string
*               description: out_msatoshi
*             out_msat:
*               type: string
*               description: out_msat
*             fee:
*               type: string
*               description: fee
*             fee_msat:
*               type: string
*               description: fee_msat
*       500:
*         description: Server error
*/
exports.listForwardsFilter = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var {offset, maxLen, reverse} = req.query
    //Call the listforwards command
    ln.listforwards().then(data => {
        var forwards = [1, 2, 3, 4,4 ,5 ,6 ,7 ,8]
        if(!offset) {
            offset = 0;
        }
        offset = parseInt(offset)
        //below 2 lines will readjust the offset inside range incase they went out of it
        offset = Math.max(offset, 0)
        offset = Math.min(Math.max(forwards.length - 1, 0), offset)
        if(!maxLen) {
            maxLen = forwards.length - offset
        }
        maxLen = parseInt(maxLen)
        if(!reverse) {
            reverse = false
        }
        reverse = !(reverse === 'false' || reverse === false)
        //below logic will adjust last index inside the range incase they went out
        var lastIndex = 0
        var firstIndex = 0
        if(forwards.length == 0) {
            firstIndex = 0
            lastIndex = 0
        }
        else if(reverse === true) {
            offset = (forwards.length-1) - offset
            firstIndex = offset
            lastIndex = Math.max(0, offset-(maxLen - 1))

        } else if(reverse === false) {
            firstIndex = offset
            lastIndex = Math.min(forwards.length - 1, offset+(maxLen - 1))
        }
        global.logger.log('listforwards success');
        res.status(200).json({first_index_offset:firstIndex, listForwards:data.forwards, last_index_offset:lastIndex});
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
