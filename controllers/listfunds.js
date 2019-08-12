//This controller houses the listfunds functions

//Function # 1
//Invoke the 'lisfunds' command return the on-chain and channel fund information from the node
//Arguments - No arguments
exports.listFunds = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listfunds command
    ln.listfunds().then(data => {
        console.log(data);
        res.status(200).json(data);
    }).catch(err => {
        console.warn(err);
        res.status(401).json(err);
    });
    ln.removeListener('error', connFailed);
    console.log('listFunds success');
}