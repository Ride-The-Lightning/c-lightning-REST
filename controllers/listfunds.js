//This controller houses the listfunds functions

//Function # 1
//Invoke the 'lisfunds' command return the on-chain and channel fund information from the node
//Arguments - No arguments
/**
* @swagger
* /listFunds:
*   get:
*     tags:
*       - General Information
*     name: listfunds
*     summary: Lists on-chain and channel funds
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: Returned fund information successfully
*         schema:
*           type: object
*           properties:
*             outputs:
*               type: object
*               properties:
*                 txid:
*                   type: string
*                   description: txid
*                 output:
*                   type: integer
*                   description: output
*                 value:
*                   type: integer
*                   description: value
*                 amount_msat:
*                   type: string
*                   description: amount_msat
*                 address:
*                   type: string
*                   description: address
*                 status:
*                   type: string
*                   description: status
*                 blockheight:
*                   type: integer
*                   description: blockheight
*               description: outputs
*             channels:
*               type: object
*               properties:
*                 peer_id:
*                   type: string
*                   description: peer_id
*                 connected:
*                   type: string
*                   description: connected
*                 state:
*                   type: string
*                   description: state
*                 short_channel_id:
*                   type: string
*                   description: short_channel_id
*                 channel_sat:
*                   type: integer
*                   description: channel_sat
*                 our_amount_msat:
*                   type: string
*                   description: our_amount_msat
*                 channel_total_sat:
*                   type: integer
*                   description: channel_total_sat
*                 amount_msat:
*                   type: string
*                   description: amount_msat
*                 funding_txid:
*                   type: string
*                   description: funding_txid
*                 funding_output:
*                   type: integer
*                   description: funding_output
*               description: channels
*       500:
*         description: Server error
*/
exports.listFunds = (req,res) => {
    global.logger.log('listFunds initiated...');
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listfunds command
    ln.listfunds().then(data => {
        global.logger.log('listFunds success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}