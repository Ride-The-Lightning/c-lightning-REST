var router = require('express').Router();
var getinfoController = require('../controllers/getinfo');

router.get('/', getinfoController.getinfo);
router.get('/custom/', getinfoController.getinfoRtl);

module.exports  = router;