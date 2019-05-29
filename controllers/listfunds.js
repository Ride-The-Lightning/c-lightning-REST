
exports.listFunds = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    ln.listfunds().then(data => {
        console.log(data);
        res.status(200).json(data);
    });
    ln.removeListener('error', connFailed);
    console.log('listFunds success');
}