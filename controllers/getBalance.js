exports.getBalance = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.listfunds().then(data => {
        var opArray = data.outputs;
        var confBalance = 0;
        var unconfBalance = 0;
        var totalBalance = 0;
        for (var i = 0; i < opArray.length; i++ )
        {
            if(opArray[i].status === 'confirmed')
                confBalance = confBalance + opArray[i].value;
        }
        totalBalance = confBalance + unconfBalance;
        console.log('confBalance -> ' + confBalance);
        console.log('unconfBalance -> ' + unconfBalance);
        console.log('totalBalance -> ' + totalBalance);
        const walBalance = {
            totalBalance: totalBalance,
            confBalance: confBalance,
            unconfBalance: unconfBalance
        }
        res.status(200).json(walBalance);
    });
    ln.removeListener('error', connFailed);
    console.log('getBalance success');
}