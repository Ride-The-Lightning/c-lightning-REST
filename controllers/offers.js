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
*     description: Core documentation - https://lightning.readthedocs.io/lightning-offer.7.html 
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
*     description: Core documentation - https://lightning.readthedocs.io/lightning-listoffers.7.html
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
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//This controller houses all the offers functions

//Function # 3
//Invoke the 'fetchinvoice' command to fetch an invoice for an offer
//Arguments - Offer (required), Amount (optional)
/**
* @swagger
* /offers/fetchInvoice:
*   post:
*     tags:
*       - Offers
*     name: fetchInvoice
*     summary: Fetch an invoice for an offer
*     description: Core documentation - https://lightning.readthedocs.io/lightning-fetchinvoice.7.html
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: offer
*         description: Bolt12 offer string beginning with "lno1"
*         type: string
*         required:
*           - offer
*       - in: body
*         name: amtMsats
*         description: Required only if the offer does not specify an amount at all
*         type: string
*     responses:
*       201:
*         description: Bolt12-encoded invoice string is returned
*         schema:
*           type: object
*           properties:
*             invoice:
*               type: string
*               description: The bolt12-encoded invoice string, starting with "lni1"
*             changes:
*               type: object
*               description: an object detailing changes between the offer and invoice
*       500:
*         description: Server error
*/
exports.fetchInvoice = (req,res) => {
    global.logger.log('fetch invoice initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set required params
    var offr = req.body.offer;
    //Set optional params
    /*
    if(req.body.amtMsats)
        msats = req.body.amtMsats;
    */
    //Call the fetchinvoice command with the offer and amount if specified
    ln.fetchinvoice(offer=offr).then(data => {
        global.logger.log('fetch invoice creation success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 4
//Invoke the 'disableoffer' command to disable an offer
//Arguments - Offer id (required)
/**
* @swagger
* /offers/disableOffer:
*   delete:
*     tags:
*       - Offers
*     name: disableoffer
*     summary: Disable an existing offer
*     description: Core documentation - https://lightning.readthedocs.io/lightning-disableoffer.7.html
*     parameters:
*       - in: route
*         name: offerid
*         description: Offer ID
*         type: string
*         required:
*           - offerid
*     responses:
*       202:
*         description: Offer disabled successfully
*         schema:
*           type: object
*           properties:
*             offer_id:
*               type: string
*               description: The merkle hash of the offer (always 64 characters)
*             active:
*               type: boolean
*               description: Whether the offer can produce invoices/payments (always false)
*             single_use:
*               type: boolean
*               description: Whether the offer is disabled after first successful use
*             bolt12:
*               type: string
*               description: The bolt12 string representing this offer
*             used:
*               type: boolean
*               description: Whether the offer has had an invoice paid / payment made
*             label:
*               type: string
*               description: The label provided when offer was created (optional)
*       500:
*         description: Server error
*/
exports.disableOffer = (req,res) => {
    global.logger.log('disableOffer initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Call the close command with the params
    ln.disableoffer(offer_id=req.params.offerid).then(data => {
        global.logger.log('disableOffer success');
        res.status(202).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}