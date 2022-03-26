//This controller houses the withdrawal functions

//Function # 1
//Invoke the 'withdraw' command to send the on-chain funds out
//Arguments - Wallet address (required), Amount in Satoshis (required)
/**
* @swagger
* /withdraw:
*   post:
*     tags:
*       - On-Chain fund management
*     name: withdraw
*     summary: Send funds from c-lightning internal wallet to the address specified
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: address
*         description: Any Bitcoin accepted type, including bech32
*         type: string
*         required:
*           - address
*       - in: body
*         name: satoshis
*         description: Amount to be withdrawn. The string "all" can be used to specify withdrawal of all available funds
*         type: string
*         required:
*           - satoshis
*       - in: body
*         name: feeRate
*         description: urgent, normal or slow
*         type: string
*         default: normal
*       - in: body
*         name: minConf
*         type: integer
*         description: minimum number of confirmations that used outputs should have
*       - in: body
*         name: utxos
*         description: Specifies the utxos to be used to fund the channel, as an array of "txid:vout"
*         type: array
*         items:
*           type: string
*     responses:
*       201:
*         description: withdraw call executed successfully
*         schema:
*           type: object
*           properties:
*             tx:
*               type: string
*               description: tx
*             txid:
*               type: string
*               description: txid
*       500:
*         description: Server error
*/
exports.withdraw = (req,res) => {
    global.logger.log('withdraw initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var address = req.body.address;
    var satoshis = req.body.satoshis;
    //Set optional params
    var feerate = (req.body.feeRate) ? req.body.feeRate : null;
    var minconf = (req.body.minConf) ? req.body.minConf : null;
    var utxos = (req.body.utxos) ? req.body.utxos : null; //coin selection

    //Call the withdraw function with the address provided
    ln.withdraw(destination=address,
        satoshi=satoshis,
        feerate=feerate,
        minconf=minconf,
        utxos=utxos).then(data => {
        global.logger.log('withdraw success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}