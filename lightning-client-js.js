//Credit to Shesek for "github:shesek/lightning-client-js".
//This is the main library, which enables connection with the c-lightning node
'use strict';

const path = require('path');
const net = require('net');
const fs = require('fs');
const debug = require('debug')('lightning-client');
const {EventEmitter} = require('events');
const JSONParser = require('jsonparse');
const LightningError = require('error/typed')({ type: 'lightning', message: 'lightning-client error' });
const methods = require('./methods');

const defaultRpcPath = path.join(require('os').homedir(), '.lightning')
    , fStat = (...p) => fs.statSync(path.join(...p))
    , fExists = (...p) => fs.existsSync(path.join(...p));

let somedata = '';

class LightningClient extends EventEmitter {
    constructor(rpcPath=defaultRpcPath) {
        global.logger.log("rpcPath -> " + rpcPath);

        if (!path.isAbsolute(rpcPath)) {
            throw new Error('The rpcPath must be an absolute path');
        }

        if (!fExists(rpcPath) || !fStat(rpcPath).isSocket()){
            // network directory provided, use the lightning-rpc within it
            if (fExists(rpcPath, 'lightning-rpc')) {
            rpcPath = path.join(rpcPath, 'lightning-rpc');
            }
            // main data directory provided, default to using the bitcoin mainnet subdirectory
            else if (fExists(rpcPath, 'bitcoin', 'lightning-rpc')) {
            global.logger.error(`WARN: ${rpcPath}/lightning-rpc is missing, using the bitcoin mainnet subdirectory at ${rpcPath}/bitcoin instead.`)
            rpcPath = path.join(rpcPath, 'bitcoin', 'lightning-rpc')
            }
            // or using the bitcoin testnet subdirectory
            else if (fExists(rpcPath, 'testnet', 'lightning-rpc')) {
            global.logger.error(`WARN: ${rpcPath}/lightning-rpc is missing, using the bitcoin testnet subdirectory at ${rpcPath}/testnet instead.`)
            rpcPath = path.join(rpcPath, 'testnet', 'lightning-rpc')
            }
            // or using the bitcoin signet subdirectory
            else if (fExists(rpcPath, 'signet', 'lightning-rpc')) {
            global.logger.error(`WARN: ${rpcPath}/lightning-rpc is missing, using the bitcoin signet subdirectory at ${rpcPath}/signet instead.`)
            rpcPath = path.join(rpcPath, 'signet', 'lightning-rpc')
            }
            // or using the bitcoin regtest subdirectory
            else if (fExists(rpcPath, 'regtest', 'lightning-rpc')){
            global.logger.error(`WARN: ${rpcPath}/lightning-rpc is missing, using the bitcoin regtest subdirectory at ${rpcPath}/regtest instead.`)
            rpcPath = path.join(rpcPath, 'regtest', 'lightning-rpc')
            }
        }

        global.logger.log(`Connecting to ${rpcPath}`);

        super();
        this.rpcPath = rpcPath;
        this.reconnectWait = 0.5;
        this.reconnectTimeout = null;
        this.reqcount = 0;
        this.parser = new JSONParser

        const _self = this;

        this.client = net.createConnection(rpcPath);
        this.clientConnectionPromise = new Promise(resolve => {
            _self.client.on('connect', () => {
                global.logger.log(`Lightning client connected`);
                _self.reconnectWait = 1;
                resolve();
            });

            _self.client.on('end', () => {
                console.log('Lightning client connection closed');
            });

            _self.client.on('error', error => {
                global.logger.error(`Lightning client connection error`, error);
                _self.emit('error', error);
                _self.increaseWaitTime();
                _self.reconnect();
            });
        });

        this.client.on('data', data => _self._handledata(data));

        this.parser.onValue = function(val) {
          if (this.stack.length) return; // top-level objects only
          debug('#%d <-- %O', val.id, val.error || val.result)
          _self.emit('res:' + val.id, val);
        }

    }

    increaseWaitTime() {
        if (this.reconnectWait >= 16) {
            this.reconnectWait = 16;
        } else {
            this.reconnectWait *= 2;
        }
    }

    reconnect() {
        const _self = this;

        if (this.reconnectTimeout) {
            return;
        }

        this.reconnectTimeout = setTimeout(() => {
            global.logger.log('Trying to reconnect...');

            _self.client.connect(_self.rpcPath);
            _self.reconnectTimeout = null;
        }, this.reconnectWait * 1000);
    }

    call(method, args = []) {
        const _self = this;

        const callInt = ++this.reqcount;
        const sendObj = {
            jsonrpc: "2.0",
            method,
            params: args,
            id: ''+callInt
        };

        //global.logger.log('#%d --> %s', callInt, method);
        //global.logger.log(args);

        // Wait for the client to connect
        return this.clientConnectionPromise
            .then(() => new Promise((resolve, reject) => {
                // Send the command
                _self.client.write(JSON.stringify(sendObj));

                // Wait for a response
                this.once('res:' + callInt, res => res.error == null
                  ? resolve(res.result)
                  : reject(LightningError(res.error))
                );
            }));
    }

    _handledata(data) {
        if (typeof global.REST_PLUGIN_CONFIG === 'undefined')  {
            this.parser.write(data)
        } else {
            somedata += data
            if (somedata.length > 1 && somedata.slice(-2) === "\n\n") {
                this.parser.write(somedata)
                somedata = ''
            }
        }
    
    }
}

const protify = s => s.replace(/-([a-z])/g, m => m[1].toUpperCase());

methods.forEach(k => {
    LightningClient.prototype[protify(k)] = function (...args) {
        return this.call(k, args);
    };
});

module.exports = rpcPath => new LightningClient(rpcPath);
module.exports.LightningClient = LightningClient;
module.exports.LightningError = LightningError;
