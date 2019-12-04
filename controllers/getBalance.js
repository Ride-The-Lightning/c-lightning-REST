//This controller houses the on-chain balance functions

//Function # 1
//Invoke the 'listfunds' command to fetch the confirmed, unconfirmed and total on-chain balance
//Arguments - No arguments
/**
* @swagger
* /getBalance:
*   get:
*     tags:
*       - General Information
*     name: getbalance
*     summary: Returns confirmed and unconfirmed on-chain balance
*     responses:
*       200:
*         description: Balance information fetched successfully
*         schema:
*           type: object
*           properties:
*             totalBalance:
*               type: integer
*               description: totalBalance
*             confBalance:
*               type: integer
*               description: confBalance
*             unconfBalance:
*               type: integer
*               description: unconfBalance
*       500:
*         description: Server error
*/
exports.getBalance = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listfunds command
    ln.listfunds().then(data => {
        var opArray = data.outputs;
        var confBalance = 0;
        var unconfBalance = 0;
        var totalBalance = 0;
        for (var i = 0; i < opArray.length; i++ )
        {
            if(opArray[i].status === 'confirmed')
                confBalance = confBalance + opArray[i].value;
            else if(opArray[i].status === 'unconfirmed')
                unconfBalance = unconfBalance + opArray[i].value;
        }
        totalBalance = confBalance + unconfBalance;
        const walBalance = {
            totalBalance: totalBalance,
            confBalance: confBalance,
            unconfBalance: unconfBalance
        }
        global.logger.log('getBalance success');
        res.status(200).json(walBalance);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}