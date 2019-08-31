var router = require('express').Router();
var getinfoController = require('../controllers/getinfo');
var tasteMacaroon = require('../utils/tasteMacaroon');

//Get the basic information from the node
router.get('/', tasteMacaroon, getinfoController.getinfo);
//router.get('/custom/', getinfoController.getinfoRtl);

module.exports  = router;