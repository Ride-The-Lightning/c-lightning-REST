//This controller houses all the peer functions

//Function # 1
//Invoke the 'connect' command to connect with a network peer
//Arguments - Pub key of the peer (required)
exports.connectPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var publicKey = req.params.pubKey;

    //Call the connect command with peer pub key
    ln.connect(publicKey).then(data => {
        console.log('id -> '+ data.id);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(402).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('connectPeer success');
}

//Function # 2
//Invoke the 'listpeers' command to get the list of connected peers
//Arguments - No arguments
exports.listPeers = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    const peersList = [];

    //Call the listpeers command
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
    console.log('listPeers success');
}