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
    if(req.riskFactor)
        rf = req.params.riskFactor;

    //Call the getroute command
    ln.getroute(id, msatoshis, rf).then(data => {
        Promise.all(
            data.route.map(rt => {
              return getAliasForPubkey(rt.id);
            })
        ).then(function(values) {
            data.route.forEach((rt, i) => {
                rt.alias = values[i];
            });
            res.status(200).json(data.route);
          }).catch(err => {
            console.error(err.error);
          });
        });
    ln.removeListener('error', connFailed);
}

//Function to fetch the alias for pub key
getAliasForPubkey = (id) => {
    return new Promise(function(resolve, reject) {
        ln.listnodes(id).then(data => {
            console.log(data.nodes[0].alias);
            resolve(data.nodes[0].alias);
        }).catch(err => {
            console.warn('Node lookup for getroute failed\n');
            console.warn(err);
            resolve('');
        });
    });
  }