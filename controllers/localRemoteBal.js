exports.localRemoteBal = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.listfunds().then(data => {
        var chanArray = data.channels;
        var localBalance = 0;
        var remoteBalance = 0;
        for (var i = 0; i < chanArray.length; i++ )
        {
            localBalance = localBalance + chanArray[i].channel_sat;
            remoteBalance = remoteBalance + (chanArray[i].channel_total_sat - chanArray[i].channel_sat);
        }
        console.log('localbalance -> ' + localBalance);
        console.log('remotebalance -> ' + remoteBalance);
        const lclRmtBal = {
            localBalance: localBalance,
            remoteBalance: remoteBalance
        }
        res.status(200).json(lclRmtBal);
    });
    ln.removeListener('error', connFailed);
    console.log('listfunds success');
}