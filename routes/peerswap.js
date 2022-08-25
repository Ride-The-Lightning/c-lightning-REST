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

// Add peer to allowlist
router.get('/addPeer/:pubkey', tasteMacaroon, PeerswapController.addPeer);

// Remove peer from allowlist
router.get('/removePeer/:pubkey', tasteMacaroon, PeerswapController.removePeer);

// Resends last swap message
router.get('/resendMessage/:swapId', tasteMacaroon, PeerswapController.resendMessage);

// Swap In
router.post('/swapIn', tasteMacaroon, PeerswapController.swapIn);

// Swap out
router.post('/swapOut', tasteMacaroon, PeerswapController.swapOut);

module.exports  = router;