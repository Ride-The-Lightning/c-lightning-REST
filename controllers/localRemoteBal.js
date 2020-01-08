//This controller houses the local-remote channel balance functions

//Function # 1
//Invoke the 'listfunds' command to calculate and return local-remote channel balances
//Arguments - No arguments
/**
* @swagger
* /channel/localRemoteBal:
*   get:
*     tags:
*       - Channel Management
*     name: localremotebal
*     summary: Fetches the aggregate local and remote channel balance on the node
*     responses:
*       200:
*         description: Local-Remote balance returned successfully
*         schema:
*           type: object
*           properties:
*             localBalance:
*               type: integer
*               description: localBalance
*             remoteBalance:
*               type: integer
*               description: remoteBalance
*             pendingBalance:
*               type: integer
*               description: pendingBalance
*             inactiveBalance:
*               type: integer
*               description: inactiveBalance
*       500:
*         description: Server error
*/
exports.localRemoteBal = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listfunds command
    ln.listfunds().then(data => {
        var chanArray = data.channels;
        var localBalance = 0;
        var remoteBalance = 0;
        var pendingBalance = 0;
        var inactiveBalance = 0;
        for (var i = 0; i < chanArray.length; i++ )
        {
            if((chanArray[i].state === 'CHANNELD_NORMAL') && chanArray[i].connected === true){
            localBalance = localBalance + chanArray[i].channel_sat;
            remoteBalance = remoteBalance + (chanArray[i].channel_total_sat - chanArray[i].channel_sat);
            }
            else if((chanArray[i].state === 'CHANNELD_NORMAL') && chanArray[i].connected === false) {
                inactiveBalance = inactiveBalance + chanArray[i].channel_sat;
            }
            else if(chanArray[i].state === 'CHANNELD_AWAITING_LOCKIN') {
                pendingBalance = pendingBalance + chanArray[i].channel_sat;
            }
        }
        global.logger.log('localbalance -> ' + localBalance);
        global.logger.log('remotebalance -> ' + remoteBalance);
        global.logger.log('pendingBalance -> ' + pendingBalance);
        global.logger.log('inactiveBalance -> ' + inactiveBalance);
        const lclRmtBal = {
            localBalance: localBalance,
            remoteBalance: remoteBalance,
            inactiveBalance: inactiveBalance,
            pendingBalance: pendingBalance
        }
        global.logger.log('localRemoteBal success');
        res.status(200).json(lclRmtBal);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}