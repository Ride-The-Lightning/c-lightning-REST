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
            console.error(err.error);
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
            console.warn('Node lookup for getroute failed\n');
            console.warn(err);
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
        console.log('listnodes success');
        res.status(200).json(data.nodes);
    }).catch(err => {
        console.warn(err);
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
        console.log('listchannels success');
        res.status(200).json(data.channels);
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}