//This controller houses the withdrawal functions

//Function # 1
//Invoke the 'withdraw' command to send the on-chain funds out
//Arguments - Wallet address (required), Amount in Satoshis (required)
exports.withdraw = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var address = req.body.address;
    var satoshis = req.body.satoshis;
    //Set optional params
    var feerate = (req.body.feeRate) ? req.body.feeRate : null;
    var minconf = (req.body.minConf) ? req.body.minConf : null;

    //Call the withdraw function with the address provided
    ln.withdraw(destination=address,
        satoshi=satoshis,
        feerate=feerate,
        minconf=minconf).then(data => {
        console.log('tx -> '+ data.tx);
        console.log('txid -> '+ data.txid);
        res.status(201).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(500).json({error: err});
    });
    
    ln.removeListener('error', connFailed);
    console.log('withdraw success');
}