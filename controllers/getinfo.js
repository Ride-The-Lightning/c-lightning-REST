//This controller houses all the getinfo functions

//Function # 1
//Invoke the 'getinfo' command to return a custom response for RTL
//Arguments - No arguments
exports.getinfoRtl = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the getinfo command
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

//Function # 2
//Invoke the 'getinfo' command to return the complete response
//Arguments - No arguments
exports.getinfo = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the getinfo command
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