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
*     description: Core documentation - https://lightning.readthedocs.io/lightning-fundchannel.7.html
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
*         name: feeRate
*         description: urgent/normal/slow/<sats>perkw/<sats>perkb
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
*     description: Core documentation - https://lightning.readthedocs.io/lightning-listchannels.7.html
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
*     description: Core documentation - https://lightning.readthedocs.io/lightning-setchannelfee.7.html
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
*     description: Core documentation - https://lightning.readthedocs.io/lightning-close.7.html
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
//Arguments - status (optional),  inChannel (optional), outChannel (optional)
/**
* @swagger
* /channel/listForwards:
*   get:
*     tags:
*       - Channel Management
*     name: listforwards
*     summary: Fetch the list of the forwarded htlcs
*     description: Core Documentation - https://lightning.readthedocs.io/lightning-listforwards.7.html
*     parameters:
*       - in: query
*         name: status
*         description: status can be either "offered" or "settled" or "failed" or "local_failed"
*         type: string
*     responses:
*       200:
*         description: List of forwarded htlcs are returned per the params specified
*         schema:
*           type: object
*           properties:
*             in_channel:
*               type: string
*               description: in_channel
*             in_msat:
*               type: string
*               description: in_msat
*             status:
*               type: string
*               description: one of "offered", "settled", "local_failed", "failed"
*             received_time:
*               type: string
*               description: the UNIX timestamp when this was received
*             out_channel:
*               type: string
*               description: the channel that the HTLC was forwarded to
*             payment_hash:
*               type: string
*               description: payment hash sought by HTLC (always 64 characters)
*             fee_msat:
*               type: string
*               description: If out_channel is present, the amount this paid in fees
*             out_msat:
*               type: string
*               description: If out_channel is present, the amount we sent out the out_channel
*             resolved_time:
*               type: string
*               description: If status is "settled" or "failed", the UNIX timestamp when this was resolved
*             failcode:
*               type: string
*               description: If status is "local_failed" or "failed", the numeric onion code returned
*             failreason:
*               type: string
*               description: If status is "local_failed" or "failed", the name of the onion code returned
*       500:
*         description: Server error
*/
exports.listForwards = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listforwards command
    ln.listforwards().then(data => {
        global.logger.log('listforwards success');
        if(req.query.status) {
            if(data.forwards.length === 0)
                res.status(200).json(data.forwards);
            else {
                let filteredForwards = data.forwards.filter(function (currentElement){
                    return currentElement.status === req.query.status;
                });
                res.status(200).json(filteredForwards);
            }
        }
        else
            res.status(200).json(data.forwards);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 6
//Invoke the 'listForwardsFilter' command to list the forwarded htlcs
//Arguments - reverse (optional),  offset (optional), maxLen (optional)
/**
* @swagger
* /channel/listForwardsFilter:
*   get:
*     tags:
*       - Channel Management
*     name: listForwardFilter
*     summary: Fetch the paginated list of the forwarded htlcs
*     description: Core Documentation - https://lightning.readthedocs.io/lightning-listforwards.7.html
*     parameters:
*       - in: query
*         name: reverse
*         description: if true offset is from the end, else from the start
*         type: boolean
*       - in: query
*         name: offset
*         description: amount of forwards you want to skip from the list, from start if reverse is false, from end if reverse is true.
*         type: integer
*       - in: query
*         name: maxLen
*         description: maximum range after the offset you want to forward.
*         type: integer
*     responses:
*       200:
*         description: An object is returned with index values and an array of forwards
*         schema:
*           type: object
*           properties:
*             firstIndexOffset:
*               type: integer
*               description: starting index of the subarray
*             lastIndexOffset:
*               type: integer
*               description: last index of the subarray
*             listForwards:
*               type: object
*               description: forwarded htlcs
*               properties:
*                   in_channel:
*                       type: string
*                       description: the channel that received the HTLC
*                   in_msat:
*                       type: string
*                       description: the value of the incoming HTLC
*                   status:
*                       type: string
*                       description: still ongoing, completed, failed locally, or failed after forwarding
*                   received_time:
*                       type: string
*                       description: the UNIX timestamp when this was received
*                   out_channel:
*                       type: string
*                       description: the channel that the HTLC was forwarded to
*                   payment_hash:
*                       type: string
*                       description: payment hash sought by HTLC (always 64 characters)
*                   fee_msat:
*                       type: string
*                       description: If out_channel is present, the amount this paid in fees
*                   out_msat:
*                       type: string
*                       description: If out_channel is present, the amount we sent out the out_channel
*                   resolved_time:
*                       type: string
*                       description: If status is "settled" or "failed", the UNIX timestamp when this was resolved
*                   failcode:
*                       type: string
*                       description: If status is "local_failed" or "failed", the numeric onion code returned
*                   failreason:
*                       type: string
*                       description: If status is "local_failed" or "failed", the name of the onion code returned
*       500:
*         description: Server error
*/
exports.listForwardsFilter = (req,res) => {
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
        //below 2 lines will readjust the offset inside range incase they went out of it
        offset = Math.max(offset, 0)
        offset = Math.min(Math.max(forwards.length - 1, 0), offset)
        if(!maxLen) {
            maxLen = forwards.length - offset
        }
        maxLen = parseInt(maxLen)
        // since length is a scalar quantity it will throw error if maxLen is negative
        if(maxLen<0) {
            throw Error ('maximum length cannot be negative')
        }
        if(!reverse) {
            reverse = false
        }
        reverse = !(reverse === 'false' || reverse === false)
        //below logic will adjust last index inside the range incase they went out
        var lastIndex = 0
        var firstIndex = 0
        var fill = []
        if(reverse === true && forwards.length !== 0) {
            if(offset === 0)
                offset = forwards.length - offset;
            lastIndex = offset - 1;
            firstIndex = Math.max(0, offset-maxLen);
            for(var i=lastIndex; i>=firstIndex; i--) {
                fill.push(forwards[i])
            }
        } else if(reverse === false && forwards.length !== 0) {
            firstIndex = (offset === 0) ? offset : (offset + 1);
            lastIndex = Math.min(forwards.length - 1, firstIndex+(maxLen-1));
            for(var i=lastIndex; i>=firstIndex; i--) {
                fill.push(forwards[i])
            }
        }
        global.logger.log('listforwards success');
        var response = {firstIndexOffset:firstIndex, lastIndexOffset:lastIndex, listForwards:fill }
        res.status(200).json(response);
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
