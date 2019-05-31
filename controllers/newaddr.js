
exports.newaddr = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    var addressType = req.params.addrType;
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
        res.status(401).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('newaddr success');
}