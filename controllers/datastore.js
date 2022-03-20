//This controller houses all the datastore functions

//Function # 1
//Invoke the 'datastore' command to store data in the c-lightning database
//Arguments - key [required], string, hex, mode, generation
/**
* @swagger
* /datastore:
*   post:
*     tags:
*       - Data Store
*     name: datastore
*     summary: The datastore RPC command allows plugins to store data in the c-lightning database, for later retrieval
*     description: Core documentation - https://lightning.readthedocs.io/lightning-datastore.7.html
*     consumes:
*       - application/json
*     parameters:
*       - in: body
*         name: key
*         description: Array of values to form a heirarchy. A key can either have children or a value, never both
*         type: array
*         items: string
*         required:
*           - key
*       - in: body
*         name: string
*         description: Value of the element
*         type: string
*       - in: body
*         name: mode
*         description: One of must-create/must-replace/create-or-replace/must-append/create-or-append
*         type: string
*       - in: body
*         name: generation
*         description: If specified, means that the update will fail if the previously-existing data is not exactly that generation
*         type: string
*     responses:
*       201:
*         description: On success, an object is returned
*         schema:
*           type: object
*           properties:
*             key:
*               type: array
*               items: string
*               description: key added to the datastore
*             generation:
*               type: string
*               description: generation
*             hex:
*               type: string
*               description: hex
*             string:
*               type: string
*               description: string
*       500:
*         description: Server error
*/
exports.dataStore = (req,res) => {
    global.logger.log('datastore initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    //Set required params
    var key = req.body.key;
    //Set optional params
    var string = (req.body.string) ? req.body.string : null;
    var hex = (req.body.hex) ? req.body.hex : null;
    var mode = (req.body.mode) ? req.body.mode : null;
    var generation = (req.body.generation) ? req.body.generation : null;

    //Call the datastore command
    ln.datastore(
        key=key,
        string=string,
        hex=hex,
        mode=mode,
        generation=generation).then(data => {
        global.logger.log('datastore success');
        res.status(201).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 2
//Invoke the 'listdatastore' command for listing plugin data
//Arguments - key [optional]
/**
* @swagger
* /datastore/listDatastore:
*   get:
*     tags:
*       - Data Store
*     name: listdatastore
*     summary: Allows plugins to fetch data which was stored in the c-lightning database
*     description: Core documentation - https://lightning.readthedocs.io/lightning-listdatastore.7.html
*     consumes:
*       - application/json
*     parameters:
*       - in: query
*         name: key
*         description: key to list from the datastore
*         type: string
*     responses:
*       200:
*         description: On success, an object containing datastore is returned
*         schema:
*           type: object
*           properties:
*             key:
*               type: array
*               items: string
*               description: key added to the datastore
*             generation:
*               type: string
*               description: generation
*             hex:
*               type: string
*               description: hex
*             string:
*               type: string
*               description: string
*       500:
*         description: Server error
*/
exports.listDatastore = (req,res) => {

    global.logger.log('listDatastore initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);
    //Set optional params
    var key = (req.query.key) ? req.query.key : null;

    //Call the listdatastore command
    ln.listdatastore(key).then(data => {
        global.logger.log('listdatastore success');
        res.status(200).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

//Function # 3
//Invoke the 'deldatastore' command for removing (plugin) data
//Arguments - key (reqiured), generation (optional)
/**
* @swagger
* /datastore/delDatastore:
*   delete:
*     tags:
*       - Data Store
*     name: deldatastore
*     summary: Allows plugins to delete data it has stored in the c-lightning database
*     parameters:
*       - in: route
*         name: key
*         description: Specify the key to reference the data to delete
*         type: string
*         required:
*           - key
*       - in: query
*         name: generation
*         description: The specific version of datastore which needs to be deleted
*         type: string
*     responses:
*       202:
*         description: The data element deleted successfully
*         schema:
*           type: object
*           properties:
*             key:
*               type: array
*               items: string
*               description: key added to the datastore
*             generation:
*               type: string
*               description: generation
*             hex:
*               type: string
*               description: hex
*             string:
*               type: string
*               description: string
*       500:
*         description: Server error
*/
exports.delDatastore = (req,res) => {
    global.logger.log('delDatastore initiated...');

    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.deldatastore(req.params.key, req.query.generation).then(data => {
        global.logger.log('delDatastore success');
        res.status(202).json(data);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });

    ln.removeListener('error', connFailed);
}