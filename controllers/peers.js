//This controller houses all the peer functions

//Function # 1
//Invoke the 'connect' command to connect with a network peer
//Arguments - Pub key of the peer (required)
/**
* @swagger
* /peer/connect:
*   post:
*     tags:
*       - Peer management
*     name: connect
*     summary: Connect with a network peer
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: id
*         description: Pubkey of the peer
*         type: string
*         required:
*           - id
*     security:
*       - MacaroonAuth: []
*     responses:
*       201:
*         description: Peer connected successfully
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*               description: id
*       500:
*         description: Server error
*/
exports.connectPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the connect command with peer pub key
    ln.connect(req.body.id).then(data => {
        global.logger.log('id -> '+ data.id);
        global.logger.log('connectPeer success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listpeers' command to get the list of connected peers
//Arguments - No arguments
/**
* @swagger
* /peer/listPeers:
*   get:
*     tags:
*       - Peer management
*     name: listpeers
*     summary: Returns the list of connected peers
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: Fetch node data successfully
*         schema:
*           type: object
*           properties:
*             id:
*               type: string
*               description: id
*             connected:
*               type: string
*               description: connected
*             netaddr:
*               type: object
*               description: netaddr
*             alias:
*               type: string
*               description: alias
*       500:
*         description: Server error
*/
exports.listPeers = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listpeers command
    ln.listpeers().then(data => {
        Promise.all(
            data.peers.map(peer => {
                return getAliasForPeer(peer);
            })
        ).then(function(peerList) {
            res.status(200).json(peerList);
          }).catch(err => {
            global.logger.error(err.error);
          });
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'disconnect' command to connect with a network peer
//Arguments - Pub key of the peer (required), Force flag to forcefully disconnect
/**
* @swagger
* /peer/disconnect:
*   delete:
*     tags:
*       - Peer management
*     name: disconnect
*     summary: Disconnect from a network peer
*     parameters:
*       - in: route
*         name: pubKey
*         description: Pubkey of the connected peer
*         type: string
*         required:
*           - pubKey
*       - in: query
*         name: force
*         description: Flag to force disconnect (true or 1)
*         type: string
*         default: false
*     security:
*       - MacaroonAuth: []
*     responses:
*       202:
*         description: Peer disconnected successfully
*       500:
*         description: Server error
*/
exports.disconnectPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var publicKey = req.params.pubKey;
    var force_flag = (req.query.force === '1' || req.query.force === 'true') ? !!req.query.force : 0;

    if(force_flag)
    {
    ln.disconnect(publicKey, force_flag).then(data => {
        global.logger.log('force disconnectPeer success');
        res.status(202).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    }
    else{
    ln.disconnect(publicKey).then(data => {
        global.logger.log('disconnectPeer success');
        res.status(202).json(data);
    }).catch(err => {
        global.logger.warn(err);
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
            global.logger.warn('Node lookup for getpeer in peers failed\n');
            global.logger.warn(err);
            peer.alias = '';
            resolve(peer);
        });
    });
  }
