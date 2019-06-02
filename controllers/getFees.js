exports.getFees = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.getinfo().then(data => {
        const feeData = {
            feeCollected: data.msatoshi_fees_collected};
        console.log('Fee Collected -> ' + feeData.feeCollected);
        res.status(200).json(feeData);
    });
    ln.removeListener('error', connFailed);
    console.log('getFees success');
}