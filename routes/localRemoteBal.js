var router = require('express').Router();
var localRemoteBalController = require('../controllers/localRemoteBal');

// Get the aggregate in-bound and out-bound channel capacity of the node
router.get('/', localRemoteBalController.localRemoteBal);

module.exports  = router;