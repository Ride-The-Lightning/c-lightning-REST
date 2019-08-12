//This controller houses all the fee functions

//Function # 1
//Invoke the 'getinfo' command to query the routing fee earned
//Arguments - No arguments
exports.getFees = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the getinfo command
    ln.getinfo().then(data => {
        const feeData = {
            feeCollected: data.msatoshi_fees_collected};
        console.log('Fee Collected -> ' + feeData.feeCollected);
        res.status(200).json(feeData);
    }).catch(err => {
        console.warn(err);
        res.status(401).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('getFees success');
}