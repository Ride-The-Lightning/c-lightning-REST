//This controller houses all the peer functions

//Function # 1
//Invoke the 'connect' command to connect with a network peer
//Arguments - Pub key of the peer (required)
exports.connectPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the connect command with peer pub key
    ln.connect(req.body.id).then(data => {
        console.log('id -> '+ data.id);
        console.log('connectPeer success');
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listpeers' command to get the list of connected peers
//Arguments - No arguments
exports.listPeers = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listpeers command
    ln.listpeers().then(data => {
        Promise.all(
            data.peers.map(peer => {
                peerData = {};
                peerData = {
                    id: peer.id,
                    connected: peer.connected,
                    netaddr: peer.netaddr,
                    globalfeatures: peer.globalfeatures,
                    localfeatures: peer.localfeatures
                };
                return getAliasForPeer(peerData);
            })
        ).then(function(peerList) {
            res.status(200).json(peerList);
          }).catch(err => {
            console.error(err.error);
          });
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'disconnect' command to connect with a network peer
//Arguments - Pub key of the peer (required), Force flag to forcefully disconnect
exports.disconnectPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var publicKey = req.params.pubKey;
    var force_flag = (req.query.force === '1' || req.query.force === 'true') ? !!req.query.force : 0;

    if(force_flag)
    {
    ln.disconnect(publicKey, force_flag).then(data => {
        console.log('force disconnectPeer success');
        res.status(202).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });
    }
    else{
    ln.disconnect(publicKey).then(data => {
        console.log('disconnectPeer success');
        res.status(202).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });
    }
    ln.removeListener('error', connFailed);
}

//Function to fetch the alias for peer
getAliasForPeer = (peer) => {
    return new Promise(function(resolve, reject) {
        ln.listnodes(peer.id).then(data => {
            peer.alias = data.nodes[0] ? data.nodes[0].alias : '';
            resolve(peer);
        }).catch(err => {
            console.warn('Node lookup for getpeer failed\n');
            console.warn(err);
            peer.alias = '';
            resolve(peer);
        });
    });
  }