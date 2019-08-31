//This controller houses the on-chain address functions

//Function # 1
//Invoke the 'newaddr' command to generate an address
//Arguments - Address Type (optional)
exports.newAddr = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var addressType = req.params.addrType;

    //Call the newaddr command
    ln.newaddr(addressType).then(data => {
        var addr = "";
        if(addressType === 'p2sh-segwit')
            addr = {address: data['p2sh-segwit']}
        else
            addr = {address: data.bech32}
        console.log('address -> '+ addr.address);
        res.status(200).json(addr);
    }).catch(err => {
        console.warn(err);
        res.status(500).json(err);
    });

    ln.removeListener('error', connFailed);
    console.log('newAddr success');
}