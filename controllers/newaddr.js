//This controller houses the on-chain address functions

//Function # 1
//Invoke the 'newaddr' command to generate an address
//Arguments - Address Type (optional)
/**
* @swagger
* /newaddr:
*   get:
*     tags:
*       - On-Chain fund management
*     name: newaddr
*     summary: Generates new on-chain address for receiving funds
*     consumes:
*       - application/json
*     parameters:
*       - in: query
*         name: addrType
*         description: Address type (bech32 or p2sh-segwit)
*         type: string
*         default: bech32
*     security:
*       - MacaroonAuth: []
*     responses:
*       200:
*         description: Address generated successfully
*         schema:
*           type: object
*           properties:
*             address:
*               type: string
*               description: address
*       500:
*         description: Server error
*/
exports.newAddr = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var addressType = req.query.addrType;

    //Call the newaddr command
    ln.newaddr(addressType).then(data => {
        global.logger.log('address -> '+ data[addressType]);
        res.status(200).json({ address: data[addressType] });
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
    global.logger.log('newAddr success');
}