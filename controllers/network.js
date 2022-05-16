//This controller houses all the network functions

//Function # 1
//Invoke the 'getroute' command to query the payment path to a destination node
//Arguments - Pub key (required), Amount in msats (required), riskfactor (optional: Default 0)
/**
* @swagger
* /network/getRoute:
*   get:
*     tags:
*       - Network Information
*     name: getroute
*     summary: Attempts to find the best route for the payment of msatoshi to a lightning node id
*     parameters:
*       - in: route
*         name: pubkey
*         description: Pub key of the node
*         type: string
*         required:
*           - pubkey
*       - in: route
*         name: msats
*         description: Amount to be routed in milli satoshis
*         type: integer
*         required:
*           - msats
*     responses:
*       200:
*         description: An array of route objects is returned
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*               description: id
*             channel:
*               type: string
*               description: channel
*             direction:
*               type: integer
*               description: direction
*             msatoshi:
*               type: integer
*               description: msatoshi
*             amount_msat:
*               type: string
*               description: amount_msat
*             delay:
*               type: integer
*               description: delay
*             alias:
*               type: string
*               description: alias
*       500:
*         description: Server error
*/
exports.getRoute = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    const id = req.params.pubKey;
    const msatoshis = req.params.msats;
    let rf = 0;
    if(req.query.riskFactor)
        rf = req.query.riskFactor;

    //Call the getroute command
    ln.getroute(id, msatoshis, rf).then(data => {
        Promise.all(
            data.route.map(rt => {
              return getAliasForRoute(rt);
            })
        ).then(function(values) {
            res.status(200).json(values);
          }).catch(pErr => {
            global.logger.error(pErr);
            res.status(500).json({error: pErr});
          });
        }).catch(err => {
            global.logger.warn(err);
            if (err.code === 205 && err.message === 'Could not find a route') {
                res.status(200).json([]);
            } else {
                res.status(500).json({error: err});
            }
        });;
    ln.removeListener('error', connFailed);
}

//Function to fetch the alias for route
getAliasForRoute = (singleroute) => {
    return new Promise(function(resolve, reject) {
        ln.listnodes(singleroute.id).then(data => {
            singleroute.alias = data.nodes[0].alias;
            resolve(singleroute);
        }).catch(err => {
            global.logger.warn('Node lookup for getroute failed\n');
            global.logger.warn(err);
            singleroute.alias = '';
            resolve(singleroute);
        });
    });
  }

//Function # 2
//Invoke the 'listnodes' command to lookup a node on the network
//Arguments - Node Pubkey
/**
* @swagger
* /network/listNode:
*   get:
*     tags:
*       - Network Information
*     name: listnode
*     summary: Gets the node information of the given pubkey
*     parameters:
*       - in: route
*         name: pubkey
*         description: Pub key of the node
*         type: string
*         required:
*           - pubkey
*     responses:
*       200:
*         description: Node data fetched successfully
*         schema:
*           type: object
*           properties:
*             nodeid:
*               type: string
*               description: nodeid
*             alias:
*               type: string
*               description: alias
*             color:
*               type: string
*               description: color
*             last_timestamp:
*               type: integer
*               description: last_timestamp
*             globalfeatures:
*               type: string
*               description: globalfeatures
*             features:
*               type: string
*               description: features
*             address:
*               type: object
*               properties:
*                 type:
*                   type: string
*                   description: type
*                 address:
*                   type: string
*                   description: address
*                 port:
*                   type: string
*                   description: port
*               description: address
*       500:
*         description: Server error
*/
exports.listNode = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listnodes command with the params
    ln.listnodes(req.params.pubKey).then(data => {
        global.logger.log('listnodes success');
        res.status(200).json(data.nodes);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'listchannels' command to lookup a channel on the network
//Arguments - Short Channel ID
/**
* @swagger
* /network/listChannel:
*   get:
*     tags:
*       - Network Information
*     name: listchannel
*     summary: Gets the channel information of the given channel ID
*     parameters:
*       - in: route
*         name: shortchannelid
*         description: Short Channel ID
*         type: string
*         required:
*           - shortchannelid
*     responses:
*       200:
*         description: An array of channel objects is returned
*         schema:
*           type: object
*           properties:
*             source:
*               type: string
*               description: source
*             destination:
*               type: string
*               description: destination
*             short_channel_id:
*               type: string
*               description: short_channel_id
*             public:
*               type: string
*               description: public
*             satoshis:
*               type: integer
*               description: satoshis
*             amount_msat:
*               type: string
*               description: amount_msat
*             message_flags:
*               type: integer
*               description: message_flags
*             channel_flags:
*               type: integer
*               description: channel_flags
*             active:
*               type: string
*               description: active
*             last_update:
*               type: integer
*               description: last_update
*             base_fee_millisatoshi:
*               type: integer
*               description: base_fee_millisatoshi
*             fee_per_millionth:
*               type: integer
*               description: fee_per_millionth
*             delay:
*               type: integer
*               description: delay
*             htlc_minimum_msat:
*               type: string
*               description: htlc_minimum_msat
*             htlc_maximum_msat:
*               type: string
*               description: htlc_maximum_msat
*       500:
*         description: Server error
*/
exports.listChannel = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    global.logger.log(req.params);
    //Call the listchannels command with the params
    ln.listchannels(req.params.shortChanId).then(data => {
        global.logger.log('listchannel network success');
        global.logger.log(data.channels);
        res.status(200).json(data.channels);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 4
//Invoke the 'feerates' command to lookup feerates on the network
//Arguments - Fee rate style ('perkb' or 'perkw')
/**
* @swagger
* /network/feeRates:
*   get:
*     tags:
*       - Network Information
*     name: feerates
*     summary: Return feerate estimates, either satoshi-per-kw or satoshi-per-kb
*     parameters:
*       - in: route
*         name: feeratestyle
*         description: fee rate style "perkw" or "perkb"
*         type: string
*         required:
*           - feeratestyle
*     responses:
*       200:
*         description: Feerate info returned successfully
*         schema:
*           type: object
*           properties:
*             perkb:
*               type: object
*               properties:
*                 urgent:
*                   type: integer
*                   description: urgent
*                 normal:
*                   type: integer
*                   description: normal
*                 slow:
*                   type: integer
*                   description: slow
*                 min_acceptable:
*                   type: integer
*                   description: min_acceptable
*                 max_acceptable:
*                   type: integer
*                   description: max_acceptable
*               description: perkb
*             onchain_fee_estimates:
*               type: object
*               properties:
*                 opening_channel_satoshis:
*                   type: integer
*                   description: opening_channel_satoshis
*                 mutual_close_satoshis:
*                   type: integer
*                   description: mutual_close_satoshis
*                 unilateral_close_satoshis:
*                   type: integer
*                   description: unilateral_close_satoshis
*               description: onchain_fee_estimates
*       500:
*         description: Server error
*/
exports.feeRates = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the feerates command with the params
    ln.feerates(req.params.rateStyle).then(data => {
        global.logger.log('feerates success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 5
//Invoke the 'estimatefees' command to lookup feerates on the network
//Arguments - None
/**
* @swagger
* /network/estimateFees:
*   get:
*     tags:
*       - Network Information
*     name: estimatefees
*     summary: Get the urgent, normal and slow Bitcoin feerates as sat/kVB
*     responses:
*       200:
*         description: Fee estimates info returned successfully
*         schema:
*           type: object
*           properties:
*             opening:
*               type: integer
*               description: opening
*             mutual_close:
*               type: integer
*               description: mutual_close
*             unilateral_close:
*               type: integer
*               description: unilateral_close
*             delayed_to_us:
*               type: integer
*               description: delayed_to_us
*             htlc_resolution:
*               type: integer
*               description: htlc_resolution
*             penalty:
*               type: integer
*               description: penalty
*             min_acceptable:
*               type: integer
*               description: min_acceptable
*             max_acceptable:
*               type: integer
*               description: max_acceptable
*       500:
*         description: Server error
*/
exports.estimateFees = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the esitmatefees command with the params
    ln.estimatefees().then(data => {
        global.logger.log('estimatefees success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 6
//Invoke the 'listnodes' command to lookup nodes on the network
//Arguments - Node Pubkey (optional)
/**
* @swagger
* /network/listNodes:
*   get:
*     tags:
*       - Network Information
*     name: listnodes
*     summary: Gets the node information from the network graph
*     parameters:
*       - in: query
*         name: id
*         description: Pub key of the node
*         type: string
*     responses:
*       200:
*         description: Node data fetched successfully
*         schema:
*           type: array
*           items:
*               type: object
*               properties:
*                   nodeid:
*                       type: string
*                       description: nodeid
*                   alias:
*                       type: string
*                       description: alias
*                   color:
*                       type: string
*                       description: color
*                   last_timestamp:
*                       type: integer
*                       description: last_timestamp
*                   features:
*                       type: string
*                       description: features
*                   address:
*                       type: object
*                       properties:
*                           type:
*                               type: string
*                               description: type
*                           address:
*                               type: string
*                               description: address
*                           port:
*                               type: string
*                               description: port
*                       description: address
*                   option_will_fund:
*                       type: object
*                       properties:
*                           lease_fee_base_msat:
*                               type: string
*                               description: lease_fee_base_msat
*                           lease_fee_basis:
*                               type: string
*                               description: lease_fee_basis
*                           funding_weight:
*                               type: string
*                               description: funding_weight
*                           channel_fee_max_base_msat:
*                               type: string
*                               description: channel_fee_max_base_msat
*                           channel_fee_max_proportional_thousandths:
*                               type: string
*                               description: channel_fee_max_proportional_thousandths
*                           compact_lease:
*                               type: string
*                               description: compact_lease
*                       description: option_will_funds
*       500:
*         description: Server error
*/
exports.listNodes = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.listnodes().then(data => {
        console.log('listLiquidityNodes success');
        let response = data.nodes;
        if (req.query.liquidity_ads && typeof req.query.liquidity_ads === 'string' && req.query.liquidity_ads.toLowerCase() === 'yes') {
            response = data.nodes.filter(node => {
                if (node.hasOwnProperty('option_will_fund')) {
                    node.option_will_fund.lease_fee_base_msat = (node.option_will_fund && node.option_will_fund.lease_fee_base_msat && typeof node.option_will_fund.lease_fee_base_msat === 'string' && node.option_will_fund.lease_fee_base_msat.includes('msat')) ? node.option_will_fund.lease_fee_base_msat.replace('msat', '') : node.option_will_fund.lease_fee_base_msat;
                    node.option_will_fund.channel_fee_max_base_msat = (node.option_will_fund && node.option_will_fund.channel_fee_max_base_msat && typeof node.option_will_fund.channel_fee_max_base_msat === 'string' && node.option_will_fund.channel_fee_max_base_msat.includes('msat')) ? node.option_will_fund.channel_fee_max_base_msat.replace('msat', '') : node.option_will_fund.channel_fee_max_base_msat;
                    return node;
                }
            });
        }
        res.status(200).json(response);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}