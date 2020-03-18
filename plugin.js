#!/usr/bin/env node
const Plugin = require('clightningjs');

const restPlugin = new Plugin();

restPlugin.addOption('rest-port', 3001, 'rest plugin listens on this port', 'int');
restPlugin.addOption('rest-docport', 4001, 'rest plugin listens on this port', 'int');
restPlugin.addOption('rest-protocol', 'https', 'rest plugin protocol', 'string');
restPlugin.addOption('rest-execmode', 'production', 'rest exec mode', 'string');
restPlugin.addOption('rest-rpc', ' ', 'allowed rpc commands', 'string');

restPlugin.onInit = params => {
    process.env.LN_PATH = `${params.configuration['lightning-dir']}/${params.configuration['rpc-file']}`

    global.REST_PLUGIN_CONFIG = {
        PORT: params.options['rest-port'],
        DOCPORT: params.options['rest-docport'],
        PROTOCOL: params.options['rest-protocol'],
        EXECMODE: params.options['rest-execmode'],
        RPCCOMMANDS: params.options['rest-rpc'].trim().split(",").map(s => s.trim()),
        PLUGIN: restPlugin
    }

    require('./cl-rest')
};

restPlugin.start();
