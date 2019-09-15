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
        global.logger.log('getFees success');
        res.status(200).json(feeData);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}