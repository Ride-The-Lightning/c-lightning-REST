//This controller houses all the network functions

//Function # 1
//Invoke the 'getroute' command to query the payment path to a destination node
//Arguments - Pub key (required), Amount in msats (required), riskfactor (optional: Default 0)

exports.getRoute = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    const id = req.params.pubKey;
    const msatoshis = req.params.msats;
    const rf = 0;
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
          }).catch(err => {
            global.logger.error(err.error);
          });
        });
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
exports.listChannel = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listchannels command with the params
    ln.listchannels(req.params.shortChanId).then(data => {
        global.logger.log('listchannels success');
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
exports.feeRates = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listchannels command with the params
    ln.feerates(req.params.rateStyle).then(data => {
        global.logger.log('feerates success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}