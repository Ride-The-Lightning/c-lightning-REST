//This controller houses the utility functions

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
        global.logger.log('getinfo success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'signmessage' command to create a digital signature with node's secret key
//Arguments - message [required]
/**
* @swagger
* /utility/signMessage:
*   post:
*     tags:
*       - General Information
*     name: signmessage
*     summary: Creates a digital signature of the message using node's secret key (message limit 65536 chars)
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: message
*         description: Message must be less that 65536 characters
*         type: string
*         required:
*           - message
*     responses:
*       201:
*         description: OK
*         schema:
*           type: object
*           properties:
*             signature:
*               type: string
*               description: signature
*             recid:
*               type: string
*               description: recid
*             zbase:
*               type: string
*               description: zbase
*       500:
*         description: Server error
*/
exports.signMessage = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the signmessage command
    ln.signmessage(req.body.message).then(data => {
        global.logger.log('signmessage success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 4
//Invoke the 'checkmessage' command to check a signature is from a node
//Arguments - message [required], zbase [required]
/**
* @swagger
* /utility/checkMessage:
*   get:
*     tags:
*       - General Information
*     name: checkmessage
*     summary: Checks a signature is from a node
*     consumes:
*       - application/json
*     parameters:
*       - in: route
*         name: message
*         description: Message must be less that 65536 characters
*         type: string
*         required:
*           - message
*       - in: route
*         name: zbase
*         description: signature
*         type: string
*         required:
*           - zbase
*     responses:
*       200:
*         description: OK
*         schema:
*           type: object
*           properties:
*             pubkey:
*               type: string
*               description: pubkey
*             verified:
*               type: boolean
*               description: verified
*       500:
*         description: Server error
*/
exports.checkMessage = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the checkmessage command
    ln.checkmessage(req.params.message, req.params.zbase).then(data => {
        global.logger.log('checkmessage success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 5
//Invoke the 'decode' command for decoding various invoice strings
//Arguments - invoice [required]
/**
* @swagger
* /utility/decode:
*   get:
*     tags:
*       - General Information
*     name: decode
*     summary: Command for decoding an invoice string
*     consumes:
*       - application/json
*     parameters:
*       - in: route
*         name: invoiceString
*         description: bolt11 or bolt12 string
*         type: string
*         required:
*           - invoiceString
*     responses:
*       200:
*         description: OK
*         schema:
*           type: object
*       500:
*         description: Server error
*/
exports.decode = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the checkmessage command
    ln.decode(req.params.invoiceString).then(data => {
        global.logger.log('decode success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}