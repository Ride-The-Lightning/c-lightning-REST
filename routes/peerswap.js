var router = require('express').Router();
var PeerswapController = require('../controllers/peerswap');
var tasteMacaroon = require('../utils/tasteMacaroon');

// Reload the policy file.
router.get('/reloadPolicy', tasteMacaroon, PeerswapController.reloadPolicy);

// Returns swap by swapid
router.get('/swap/:swapId', tasteMacaroon, PeerswapController.getSwap);

// List swaps
router.get('/listSwaps', tasteMacaroon, PeerswapController.listSwaps);

// Returns active swaps.
router.get('/listActiveSwaps', tasteMacaroon, PeerswapController.listActiveSwaps);

// Returns unhandled swaps requested by peer nodes.
router.get('/listSwapRequests', tasteMacaroon, PeerswapController.listSwapRequests);

// Lists peers supporting the peerswap plugin
router.get('/listPeers', tasteMacaroon, PeerswapController.listPeers);

// Sets peerswap to allow incoming swap requests
router.get('/allowSwapRequests/:isAllowed', tasteMacaroon, PeerswapController.allowSwapRequests);

// Add peer to allowed/suspicious list
router.get('/addPeer/:list/:pubkey?', tasteMacaroon, PeerswapController.addPeer);

// Remove peer from allowed/suspicious list
router.get('/removePeer/:list/:pubkey?', tasteMacaroon, PeerswapController.removePeer);

// Show peerswap config
router.get('/listConfig', tasteMacaroon, PeerswapController.listConfig);

// Swap In
router.post('/swapIn', tasteMacaroon, PeerswapController.swapIn);

// Swap out
router.post('/swapOut', tasteMacaroon, PeerswapController.swapOut);

module.exports  = router;
