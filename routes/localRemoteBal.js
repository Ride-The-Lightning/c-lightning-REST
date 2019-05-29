var router = require('express').Router();
var localRemoteBalController = require('../controllers/localRemoteBal');

router.get('/', localRemoteBalController.localRemoteBal);

module.exports  = router;