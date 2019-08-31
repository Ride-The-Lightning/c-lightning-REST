var router = require('express').Router();
var getinfoController = require('../controllers/getinfo');
var getBalanceController = require('../controllers/getBalance');
var localRemoteBalController = require('../controllers/localRemoteBal');
var getFeeController = require('../controllers/getFees');

router.get('/getinfo', getinfoController.getinfoRtl);
router.get('/getbalance', getBalanceController.getBalance);
router.get('/localremotebal', localRemoteBalController.localRemoteBal);
router.get('/fees', getFeeController.getFees);
module.exports  = router;