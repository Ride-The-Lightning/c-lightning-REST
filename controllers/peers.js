exports.connectPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var publicKey = req.params.pubKey;
    ln.connect(publicKey).then(data => {
        console.log('id -> '+ data.id);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('connect peer success');
}

exports.listPeers = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    const peersList = [];
    ln.listpeers().then(data => {
        let peerData = {};
        data.peers.forEach(peer => {
            peerData = {};
            peerData = {
                id: peer.id,
                connected: peer.connected,
                netaddr: peer.netaddr
            };
            console.log('id -> ' + peerData.id);
            console.log('connected -> ' + peerData.connected);
            console.log('netaddr -> ' + data.netaddr);
            peersList.push(peerData);    
        });
        res.status(201).json(peersList);
    }).catch(err => {
        console.warn(err);
        res.status(401).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('listpeers success');
}