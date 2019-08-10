var router = require('express').Router();
var getinfoController = require('../controllers/getinfo');

// Get the basic information from the node
router.get('/', getinfoController.getinfo);
//router.get('/custom/', getinfoController.getinfoRtl);

module.exports  = router;