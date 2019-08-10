
exports.getinfoRtl = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.getinfo().then(data => {
        const getinfodata = {
            identity_pubkey: data.id,
            alias: data.alias,
            num_pending_channels: data.num_pending_channels,
            num_active_channels: data.num_active_channels,
            num_inactive_channels: data.num_inactive_channels,
            num_peers: data.num_peers,
            block_height: data.blockheight,
            synced_to_chain: true,
            testnet: (data.network.includes('testnet')) ? true : false,
            chains: [{chain:'bitcoin', network: data.network}],
            version: data.version
        };
        console.log(getinfodata);
        res.status(200).json(getinfodata);
    }).catch(err => {
        console.warn(err);
        res.status(401).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('getinfoRtl success');
}

exports.getinfo = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.getinfo().then(data => {
        console.log(data);
        res.status(200).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(401).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('getinfo success');
}