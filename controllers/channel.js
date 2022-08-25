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
*         default: 'true'
*       - in: body
*         name: minConf
*         description: Minimum number of confirmations that used outputs should have
*         type: integer
*       - in: body
*         name: utxos
*         description: Specifies the utxos to be used to fund the channel, as an array of "txid:vout"
*         type: array
*         items:
*           type: string
*       - in: body
*         name: push_msat
*         description: Amount of millisatoshis to push to the channel peer at open
*         type: string
*       - in: body
*         name: close_to
*         description: Bitcoin address to which the channel funds should be sent to on close
*         type: string
*       - in: body
*         name: request_amt
*         description: Amount of liquidity you'd like to lease from the peer
*         type: string
*       - in: body
*         name: compact_lease
*         description: Compact represenation of the peer's expected channel lease terms
*         type: string
*     security:
*       - MacaroonAuth: []
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
    var reqamt = (req.body.request_amt) ? req.body.request_amt : null; //Amount requested from peer for the channel
    var cmpctLease = (req.body.compact_lease) ? req.body.compact_lease : null; //lease terms of peer
    var clst = (req.body.close_to) ? req.body.close_to : null;
    var pshmst = (req.body.push_msat) ? req.body.push_msat : null;

    //Call the fundchannel command with the pub key and amount specified
    ln.fundchannel(id=id,
        amount=satoshis,
        feerate=feerate,
        announce=announce,
        minconf=minconf,
        utxos=utxos,
        push_msat=pshmst,
        close_to=clst,
        request_amt=reqamt,
        compact_lease=cmpctLease).then(data => {
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
*     security:
*       - MacaroonAuth: []
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
            return getAliasForChannels(peer);
        })
        ).then((chanList) => {
            global.logger.log('listChannels channel success');
            res.status(200).json(chanList.flatMap(chan => chan));
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
*     security:
*       - MacaroonAuth: []
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
*     security:
*       - MacaroonAuth: []
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
    var unltrltmt = (req.query.unilateralTimeout) ? req.query.unilateralTimeout : null;
    var dstntn = (req.query.dest) ? req.query.dest : null;
    var feeNegStep = (req.query.feeNegotiationStep) ? req.query.feeNegotiationStep : null;

    //Call the close command with the params
    ln.close(id=id,
        unilaterlaltimeout=unltrltmt,
        destination=dstntn,
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
*     security:
*       - MacaroonAuth: []
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
    ln.listforwards(status=req.query.status).then(data => {
        global.logger.log('listforwards success');
        // Deleting failed and local_failed transactions after latest 1000 records
        res.status(200).json(!data.forwards ? [] : (req.query.status === 'failed' || req.query.status === 'local_failed') ? data.forwards.slice(Math.max(0, data.forwards.length - 1000), Math.max(1000, data.forwards.length)).reverse() : data.forwards.reverse());
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 6
//Invoke the 'listForwardsPaginated' command to list the forwarded htlcs
//Arguments -  status(optinal), offset(default=0), maxLen(optional)
/**
* @swagger
* /channel/listForwardsPaginated:
*   get:
*     tags:
*       - Channel Management
*     name: listForwardsPaginated
*     summary: Fetch the paginated list of the forwarded htlcs
*     description: Core Documentation - https://lightning.readthedocs.io/lightning-listforwards.7.html. <br><br>For requests with status as 'failed' or 'local_failed', the data will be cached for 10 minutes and consecutive requests will be served from cache.
*     parameters:
*       - in: query
*         name: status
*         description: status can be either "offered" or "settled" or "failed" or "local_failed"
*         type: string
*       - in: query
*         name: offset
*         description: amount of forwards you want to skip from the list. default 0
*         type: integer
*       - in: query
*         name: maxLen
*         description: maximum range after the offset you want to forward.
*         type: integer
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: An object is returned with index values and an array of forwards
*         schema:
*           type: object
*           properties:
*             status:
*               type: string
*               description: filtered forwards by status
*             offset:
*               type: integer
*               description: starting index of the subarray
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
exports.listForwardsPaginated = (req,res) => {
    try {
        var { status, offset, maxLen } = req.query;
        if (appCache.has('listForwards' + status)) {
            global.logger.log('Reading ' + status + ' listForwards from cache');
            var forwards = appCache.get('listForwards' + status);
            res.status(200).json(getRequestedPage(forwards, offset, maxLen, status));
        } else {
            function connFailed(err) { throw err }
            ln.on('error', connFailed);
            global.logger.log('Calling ' + status + ' listForwards from node');
            //Call the listforwards command
            ln.listforwards(status=status).then(data => {
                // Deleting failed and local_failed transactions after latest 1000 records
                const forwards = !data.forwards ? [] : (req.query.status === 'failed' || req.query.status === 'local_failed') ? data.forwards.slice(Math.max(0, data.forwards.length - 1000), Math.max(1000, data.forwards.length)).reverse() : data.forwards.reverse();
                // Caching data for subsequent pages
                appCache.set('listForwards' + status, forwards);
                res.status(200).json(getRequestedPage(forwards, offset, maxLen, status));
            }).catch(err => {
                global.logger.warn(err);
                res.status(500).json({error: err});
            });
            ln.removeListener('error', connFailed);
        }
    } catch (error) {
        global.logger.warn(error);
        res.status(500).json({error: error});
    }
}

getRequestedPage = (forwards, offset, maxLen, status) => {
    if (forwards.length && forwards.length > 0) {
        if(!offset || offset < 0 || offset >= forwards.length)
            offset = 0;
        offset = parseInt(offset);
        if(!maxLen || maxLen > forwards.length)
            maxLen = Math.max(forwards.length - offset, 0);
        maxLen = Math.min(parseInt(maxLen), forwards.length - offset);
        const fill = forwards.slice(offset, (maxLen + offset));
        global.logger.log('listforwards success');
        return {status: status, offset:offset, maxLen:maxLen, totalForwards: forwards.length, listForwards:fill };
    } else {
        return {status: status, offset:0, maxLen:maxLen, totalForwards: 0, listForwards:[] };
    }
}

//Function to fetch the alias for peer
getAliasForChannels = (peer) => {
    return new Promise(function(resolve, reject) {
        ln.listnodes(peer.id).then(data => {
            resolve(peer.channels.filter(c => c.state !== 'ONCHAIN' && c.state !== 'CLOSED').reduce((acc, channel) => {
                acc.push({
                    id: peer.id,
                    alias: data.nodes[0] ? data.nodes[0].alias : peer.id,
                    connected: peer.connected,
                    state: channel.state,
                    short_channel_id: channel.short_channel_id,
                    channel_id: channel.channel_id,
                    funding_txid: channel.funding_txid,
                    private: channel.private,
                    msatoshi_to_us: channel.msatoshi_to_us,
                    msatoshi_total: channel.msatoshi_total,
                    msatoshi_to_them: channel.msatoshi_total - channel.msatoshi_to_us,
                    their_channel_reserve_satoshis: channel.their_channel_reserve_satoshis,
                    our_channel_reserve_satoshis: channel.our_channel_reserve_satoshis,
                    spendable_msatoshi: channel.spendable_msatoshi,
                    funding_allocation_msat: channel.funding_allocation_msat,
                    direction: channel.direction
                });
                return acc;
            }, []));
        }).catch(err => {
            global.logger.warn('Node lookup for getpeer failed\n');
            global.logger.warn(err);
            resolve(peer.channels.filter(c => c.state !== 'ONCHAIN' && c.state !== 'CLOSED').reduce((acc, channel) => {
                acc.push({
                    id: peer.id,
                    alias: peer.id,
                    connected: peer.connected,
                    state: channel.state,
                    short_channel_id: channel.short_channel_id,
                    channel_id: channel.channel_id,
                    funding_txid: channel.funding_txid,
                    private: channel.private,
                    msatoshi_to_us: channel.msatoshi_to_us,
                    msatoshi_total: channel.msatoshi_total,
                    msatoshi_to_them: channel.msatoshi_total - channel.msatoshi_to_us,
                    their_channel_reserve_satoshis: channel.their_channel_reserve_satoshis,
                    our_channel_reserve_satoshis: channel.our_channel_reserve_satoshis,
                    spendable_msatoshi: channel.spendable_msatoshi,
                    funding_allocation_msat: channel.funding_allocation_msat,
                    direction: channel.direction
                });
                return acc;
            }, []));
        });
    });
  }

  //Function # 7
//Invoke the 'funderupdate' command for adjusting node funding v2 channels
//Arguments - Node level policy with all optional params
/**
* @swagger
* /channel/funderUpdate:
*   post:
*     tags:
*       - Channel Management
*     name: funderupdate
*     summary: Adjust the node policy for dual funded channels and liquidity ads
*     description: Core documentation - https://lightning.readthedocs.io/lightning-funderupdate.7.html
*     parameters:
*       - in: body
*         name: policy
*         description: How much capital to commit to a v2 open channel request. e.g. match/available/fixed
*         type: string
*       - in: body
*         name: policy_mod
*         description: The policy_mod is the number or 'modification' to apply to the policy
*         type: string
*       - in: body
*         name: leases_only
*         description: will only contribute funds to option_will_fund requests which pay to lease funds. Default to false
*         type: string
*       - in: body
*         name: min_their_funding_msat
*         description: Min funding sats that we require in order to activate our contribution policy to the v2 open. Defaults to 10k sats
*         type: string
*       - in: body
*         name: max_their_funding_msat
*         description: Any channel open above this will not be funded
*         type: string
*       - in: body
*         name: per_channel_min_msat
*         description: Min amount that we will contribute to a channel open. Defaults to 10k sats
*         type: string
*       - in: body
*         name: per_channel_max_msat
*         description: Max amount that we will contribute to a channel open
*         type: string
*       - in: body
*         name: reserve_tank_msat
*         description: Amount of sats to leave available in the node wallet. Defaults to zero sats.
*         type: string
*       - in: body
*         name: fuzz_percent
*         description: Percentage to fuzz the resulting contribution amount by. Valid values are 0 to 100. Default 0
*         type: string
*       - in: body
*         name: fund_probability
*         description: Percentage of v2 channel open requests to apply our policy to. Valid values are 0 to 100. Default 100
*         type: string
*       - in: body
*         name: lease_fee_base_msat
*         description: Flat fee for a channel lease. Defaults to 2k sats
*         type: string
*       - in: body
*         name: lease_fee_basis
*         description:  Basis fee that's calculated as 1/10k of the total requested funds the peer is asking for. Defaults to 65 bp
*         type: string
*       - in: body
*         name: funding_weight
*         description:  used to calculate the fee the peer will compensate your node for its contributing inputs to the funding transaction. Default is 2 inputs + 1 P2WPKH output
*         type: string
*       - in: body
*         name: channel_fee_max_base_msat
*         description: Commitment to a max base fee that your node will charge for routing payments. Default is 5k sats
*         type: string
*       - in: body
*         name: channel_fee_max_proportional_thousandths
*         description: Commitment to a max fee rate that your node will charge for routing payments. Default is 100k ppm
*         type: string
*       - in: body
*         name: compact_lease
*         description: Compact description of the channel lease params
*         type: string
*     security:
*       - MacaroonAuth: []
*     responses:
*       201:
*         description: Funding policy updated successfully
*         schema:
*           type: object
*           properties:
*             summary:
*               type: string
*               description: Summary of the current funding policy  
*             policy:
*               type: string
*               description: policy
*             policy_mod:
*               type: string
*               description: policy_mod
*             leases_only:
*               type: string
*               description: leases_only
*             min_their_funding_msat:
*               type: string
*               description: min_their_funding_msat
*             max_their_funding_msat:
*               type: string
*               description: max_their_funding_msat
*             per_channel_min_msat:
*               type: string
*               description: per_channel_min_msat
*             per_channel_max_msat:
*               type: string
*               description: per_channel_max_msat
*             reserve_tank_msat:
*               type: string
*               description: reserve_tank_msat
*             fuzz_percent:
*               type: string
*               description: fuzz_percent
*             fund_probability:
*               type: string
*               description: fund_probability
*             lease_fee_base_msat:
*               type: string
*               description: lease_fee_base_msat
*             lease_fee_basis:
*               type: string
*               description: lease_fee_basis
*             funding_weight:
*               type: string
*               description: funding_weight
*             channel_fee_max_base_msat:
*               type: string
*               description: channel_fee_max_base_msat
*             channel_fee_max_proportional_thousandths:
*               type: string
*               description: channel_fee_max_proportional_thousandths
*             compact_lease:
*               type: string
*               description: compact_lease
*       500:
*         description: Server error
*/
exports.funderUpdate = (req,res) => {
    global.logger.log('funderUpdate initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set optional params
    var policy = (req.body.policy) ? req.body.policy : null;
    var policy_mod = (req.body.policy_mod) ? req.body.policy_mod : null;
    var leases_only = (req.body.leases_only) ? req.body.leases_only : null;
    var min_their_funding_msat = (req.body.min_their_funding_msat) ? req.body.min_their_funding_msat : null;
    var max_their_funding_msat = (req.body.max_their_funding_msat) ? req.body.max_their_funding_msat : null;
    var per_channel_min_msat = (req.body.per_channel_min_msat) ? req.body.per_channel_min_msat : null;
    var per_channel_max_msat = (req.body.per_channel_max_msat) ? req.body.per_channel_max_msat : null;
    var reserve_tank_msat = (req.body.reserve_tank_msat) ? req.body.reserve_tank_msat : null;
    var fuzz_percent = (req.body.fuzz_percent) ? req.body.fuzz_percent : null;
    var fund_probability = (req.body.fund_probability) ? req.body.fund_probability : null;
    var lease_fee_base_msat = (req.body.lease_fee_base_msat) ? req.body.lease_fee_base_msat : null;
    var lease_fee_basis = (req.body.lease_fee_basis) ? req.body.lease_fee_basis : null;
    var funding_weight = (req.body.funding_weight) ? req.body.funding_weight : null;
    var channel_fee_max_base_msat = (req.body.channel_fee_max_base_msat) ? req.body.channel_fee_max_base_msat : null;
    var channel_fee_max_proportional_thousandths = (req.body.channel_fee_max_proportional_thousandths) ? req.body.channel_fee_max_proportional_thousandths : null;
    //var compact_lease = (req.body.compact_lease) ? req.body.compact_lease : null;

    //Call the funderupdate command with the params
    global.logger.log(req.body);
    ln.funderupdate(policy=policy,
        policy_mod=policy_mod,
        leases_only=leases_only,
        min_their_funding_msat=min_their_funding_msat,
        max_their_funding_msat=max_their_funding_msat,
        per_channel_min_msat=per_channel_min_msat,
        per_channel_max_msat=per_channel_max_msat,
        reserve_tank_msat=reserve_tank_msat,
        fuzz_percent=fuzz_percent,
        fund_probability=fund_probability,
        lease_fee_base_msat=lease_fee_base_msat,
        lease_fee_basis=lease_fee_basis,
        funding_weight=funding_weight,
        channel_fee_max_base_msat=channel_fee_max_base_msat,
        channel_fee_max_proportional_thousandths=channel_fee_max_proportional_thousandths).then(data => {
        global.logger.log('setChannelfee success');
        global.logger.log(data);
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}