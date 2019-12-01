//This controller houses the local-remote channel balance functions

//Function # 1
//Invoke the 'listfunds' command to calculate and return local-remote channel balances
//Arguments - No arguments
/**
* @swagger
* /localRemoteBal:
*   get:
*     tags:
*       - General Information
*     name: localremotebal
*     summary: Fetches the aggregate local and remote channel balance on the node
*     responses:
*       200:
*         description: Local-Remote balance returned successfully
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
        for (var i = 0; i < chanArray.length; i++ )
        {
            if(chanArray[i].state === 'CHANNELD_NORMAL'){
            localBalance = localBalance + chanArray[i].channel_sat;
            remoteBalance = remoteBalance + (chanArray[i].channel_total_sat - chanArray[i].channel_sat);
            }
        }
        global.logger.log('localbalance -> ' + localBalance);
        global.logger.log('remotebalance -> ' + remoteBalance);
        const lclRmtBal = {
            localBalance: localBalance,
            remoteBalance: remoteBalance
        }
        global.logger.log('localRemoteBal success');
        res.status(200).json(lclRmtBal);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}