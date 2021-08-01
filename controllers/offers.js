//This controller houses all the offers functions

//Function # 1
//Invoke the 'offer' command to setup an offer
//Arguments - Amount (required), Description (required)
/**
* @swagger
* /offers/offer:
*   post:
*     tags:
*       - Offers
*     name: offer
*     summary: Creates an offer
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: amount
*         description: Specify the amount as 'any' or '<amount>sats'. E.g. '75sats'
*         type: string
*         required:
*           - amount
*       - in: body
*         name: description
*         description: Description of the offer, to be included on the invoice
*         type: string
*         required:
*           - description
*     responses:
*       201:
*         description: An offers object is returned
*         schema:
*           type: object
*           properties:
*             offer_id:
*               type: string
*               description: The hash of the offer
*             active:
*               type: string
*               description: true if the offer is active
*             single_use:
*               type: string
*               description: true if single use was specified for the offer
*             bolt12:
*               type: string
*               description: The bolt12 offer, starting with "lno1"
*             used:
*               type: string
*               description: true if an associated invoice has been paid
*       500:
*         description: Server error
*/
exports.offer = (req,res) => {
    global.logger.log('offer creation initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var amnt = req.body.amount;
    var desc = req.body.description;
    //Set optional params
    /*
    var feerate = (req.body.feeRate) ? req.body.feeRate : null;
    var announce = (req.body.announce === '0' || req.body.announce === 'false' || !req.body.announce) ? false : true;
    var minconf = (req.body.minConf) ? req.body.minConf : null;
    var utxos = (req.body.utxos) ? req.body.utxos : null; //coin selection
    */

    //Call the fundchannel command with the pub key and amount specified
    ln.offer(amount=amnt,
        description=desc,
        ).then(data => {
        global.logger.log('offer creation success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listoffers' command get the list of offers for the node
//Arguments - No arguments
/**
* @swagger
* /channel/listOffers:
*   get:
*     tags:
*       - Offers
*     name: listoffers
*     summary: Returns a list of offers on the node
*     responses:
*       200:
*         description: An array of offers is returned
*         schema:
*           type: object
*           properties:
*             offer_id:
*               type: string
*               description: The hash of the offer
*             active:
*               type: string
*               description: true if the offer is active
*             single_use:
*               type: string
*               description: true if single use was specified for the offer
*             bolt12:
*               type: string
*               description: The bolt12 offer, starting with "lno1"
*             used:
*               type: string
*               description: true if an associated invoice has been paid
*       500:
*         description: Server error
*/
exports.listOffers = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the listforwards command
    ln.listoffers().then(data => {
        global.logger.log('listOffers success');
        res.status(200).json(data.forwards);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}