//This controller houses user enabled rpc functions

//Function # 1
//Invoke an RPC command to fetch the data for additional commands that do not have an endpoint and are enabled in the configuration
//Arguments - varies per command
/**
* @swagger
* /rpc:
*   post:
*     tags:
*       - RPC
*     name: rpc
*     summary: Issue RPC commands that are enabled in user configuration
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: method
*         description: The method to execute
*         type: string
*         required:
*           - method
*       - in: body
*         name: params
*         description: Comma separated array or a json with key-value pairs for optional params
*         type: object
*     responses:
*       200:
*         description: Information specific to the RPC command
*       500:
*         description: Server error
*/exports.rpc = (req,res) => {
  
  global.logger.log('allowed rpc commands: '+ global.config.RPCCOMMANDS);
  const commands = global.config.RPCCOMMANDS;
  
  if (commands.length === 1 && !commands[0]) {
    res.status(500).json({error: "Endpoint not enabled."});
    return;
  }

  const allowAll = commands.length === 1 && commands[0] === "*";

  if (!~commands.indexOf(req.body.method) && !allowAll) {
    res.status(500).json({error: "Command not enabled."});
    return;
  }

  function connFailed(err) { throw err }
  ln.on('error', connFailed);

  //Call the rpc command
  ln.call(req.body.method, req.body.params).then(data => {
      data.api_version = require('../package.json').version;
      global.logger.log(data);
      global.logger.log('rpc success');
      res.status(200).json(data);
  }).catch(err => {
      global.logger.warn(err);
      res.status(500).json({error: err});
  });
  ln.removeListener('error', connFailed);
}