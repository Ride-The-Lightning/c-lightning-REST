//This controller houses all the getinfo functions

//Function # 1
//Invoke the 'getinfo' command to return a custom response for RTL
//Arguments - No arguments
//fs = require( 'fs' );
//const macaroon = require('macaroon');

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
        global.logger.log(getinfodata);
        global.logger.log('getinfoRtl success');
        res.status(200).json(getinfodata);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'getinfo' command to return the complete response
//Arguments - No arguments
/**
* @swagger
* /getinfo:
*   get:
*     tags:
*       - General Information
*     name: getinfo
*     summary: Gets node information
*     responses:
*       200:
*         description: Node data fetched successfully
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*               description: id
*             alias:
*               type: string
*               description: alias
*             color:
*               type: string
*               description: color
*             num_peers:
*               type: string
*               description: num_peers
*             num_pending_channels:
*               type: string
*               description: num_pending_channels
*             num_active_channels:
*               type: string
*               description: num_active_channels
*             num_inactive_channels:
*               type: string
*               description: num_inactive_channels
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
*             binding:
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
*               description: binding
*             version:
*               type: string
*               description: version
*             blockheight:
*               type: string
*               description: blockheight
*             network:
*               type: string
*               description: network
*             msatoshi_fees_collected:
*               type: string
*               description: msatoshi_fees_collected
*             fees_collected_msat:
*               type: string
*               description: fees_collected_msat
*             api_version:
*               type: string
*               description: api_version
*       500:
*         description: Server error
*/
exports.getinfo = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the getinfo command
    ln.getinfo().then(data => {
        data.api_version = require('../package.json').version;
        global.logger.log(data);
        global.logger.log('getinfo success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}