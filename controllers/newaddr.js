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
*     responses:
*       200:
*         description: Address generated successfully
*       500:
*         description: Server error
*/
exports.newAddr = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var addressType = req.query.addrType;

    //Call the newaddr command
    ln.newaddr(addressType).then(data => {
        var addr = "";
        if(addressType === 'p2sh-segwit')
            addr = {address: data['p2sh-segwit']}
        else
            addr = {address: data.bech32}
        global.logger.log('address -> '+ addr.address);
        res.status(200).json(addr);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
    global.logger.log('newAddr success');
}