#!/usr/bin/env node
const Plugin = require('clightningjs');
let srvr;
let updatedMessage = { event: '', data: '' };

const restPlugin = new Plugin();

restPlugin.addOption('rest-port', 3001, 'rest plugin listens on this port', 'int');
restPlugin.addOption('rest-docport', 4001, 'rest plugin listens on this port', 'int');
restPlugin.addOption('rest-protocol', 'https', 'rest plugin protocol', 'string');
restPlugin.addOption('rest-execmode', 'production', 'rest exec mode', 'string');
restPlugin.addOption('rest-rpc', ' ', 'allowed rpc commands', 'string');
restPlugin.addOption('rest-lnrpcpath', ' ', 'path for lightning-rpc', 'string');
restPlugin.addOption('rest-domain', ' ', 'domain name for self-signed cert', 'string');
restPlugin.addOption('rest-ip', ' ', 'IP for self-signed cert', 'string');
restPlugin.addOption('rest-bind', ' ', 'Binding address', 'string');

restPlugin.onInit = params => {
    process.env.LN_PATH = `${params.configuration['lightning-dir']}/${params.configuration['rpc-file']}`

    global.REST_PLUGIN_CONFIG = {
        PORT: params.options['rest-port'],
        DOCPORT: params.options['rest-docport'],
        PROTOCOL: params.options['rest-protocol'],
        EXECMODE: params.options['rest-execmode'],
        RPCCOMMANDS: params.options['rest-rpc'].trim().split(",").map(s => s.trim()),
        LNRPCPATH: params.options['rest-lnrpcpath'],
        DOMAIN: params.options['rest-domain'].trim(),
        IP: params.options['rest-ip'].trim(),
        BIND: params.options['rest-bind'].trim(),
        PLUGIN: restPlugin
    }

    srvr = require('./cl-rest');
};

const EVENTS = [
    'connect',
    'disconnect',
    'channel_opened',
    'invoice_payment',
    'forward_event',
    'sendpay_success',
    'sendpay_failure'
];

EVENTS.forEach(event => {
    restPlugin.subscribe(event);
    restPlugin.notifications[event].on(event, (msg) => {
        if(srvr && srvr.wsServer && srvr.wsServer.broadcastToClients) {
            updatedMessage = { event: event, data: msg };
            srvr.wsServer.broadcastToClients(updatedMessage);
        }
    });
});

restPlugin.start();
