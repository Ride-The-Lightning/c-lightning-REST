//This controller houses all the peerswap functions

exports.reloadPolicy = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapReloadpolicy().then(policy => {
        global.logger.log('peerswap reload policy success');
        res.status(200).json(policy);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.getSwap = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapGetswap(req.params.swapId).then(swap => {
        global.logger.log('peerswap get swap success');
        res.status(200).json(swap);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.listSwaps = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapListswaps().then(swaps => {
        global.logger.log('peerswap list swaps success');
        res.status(200).json(swaps);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.listActiveSwaps = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapListactiveswaps().then(activeSwaps => {
        global.logger.log('peerswap list active swaps success');
        res.status(200).json(activeSwaps);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.listSwapRequests = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapListswaprequests().then(swapRequests => {
        global.logger.log('peerswap list swap requests success');
        res.status(200).json(swapRequests);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.listPeers = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapListpeers().then(peers => {
        global.logger.log('peerswap list peers success');
        res.status(200).json(peers);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.allowSwapRequests = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapAllowswaprequests(req.params.isAllowed).then(allowRes => {
        global.logger.log('peerswap allow swap requests success');
        res.status(200).json(allowRes);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.addPeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapAddpeer(req.params.pubkey).then(addPeerRes => {
        global.logger.log('peerswap add peer success');
        res.status(200).json(addPeerRes);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.removePeer = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapRemovepeer(req.params.pubkey).then(removePeerRes => {
        global.logger.log('peerswap remove peer success');
        res.status(200).json(removePeerRes);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.resendMessage = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapResendmsg(req.params.swapId).then(resendmsgRes => {
        global.logger.log('peerswap resend message success');
        res.status(200).json(true);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.swapIn = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapSwapIn(
        amt_sat=req.body.amountSats,
        short_channel_id=req.body.shortChannelId,
        asset=req.body.asset
    ).then(swapInRes => {
        global.logger.log('peerswap swap in success');
        res.status(200).json(swapInRes);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}

exports.swapOut = (req,res) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.peerswapSwapOut(
        amt_sat=req.body.amountSats,
        short_channel_id=req.body.shortChannelId,
        asset=req.body.asset
    ).then(swapOutRes => {
        global.logger.log('peerswap swap out success');
        res.status(200).json(swapOutRes);
    }).catch(err => {
        global.logger.warn(err);
        res.status(500).json({error: err});
    });
    ln.removeListener('error', connFailed);
}
