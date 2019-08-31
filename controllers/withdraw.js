//This controller houses the withdrawal functions

//Function # 1
//Invoke the 'withdraw' command to send the on-chain funds out
//Arguments - Wallet address (required), Amount in Satoshis (required)
exports.withdraw = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var address = req.params.addr;
    var satoshis = req.params.sats;

    //Call the withdraw function with the address provided
    ln.withdraw(address, satoshis).then(data => {
        console.log('tx -> '+ data.tx);
        console.log('txid -> '+ data.txid);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });
    
    ln.removeListener('error', connFailed);
    console.log('withdraw success');
}