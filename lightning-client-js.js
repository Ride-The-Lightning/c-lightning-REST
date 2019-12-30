//Credit to Shesek for "github:shesek/lightning-client-js".
//This is the main library, which enables connection with the c-lightning node
'use strict';

const path = require('path');
const net = require('net');
const fs = require('fs');
const debug = require('debug')('lightning-client');
const {EventEmitter} = require('events');
const JSONParser = require('jsonparse')
const LightningError = require('error/typed')({ type: 'lightning', message: 'lightning-client error' })
const methods = require('./methods');

const defaultRpcPath = path.join(require('os').homedir(), '.lightning/bitcoin')
    , fStat = (...p) => fs.statSync(path.join(...p))
    , fExists = (...p) => fs.existsSync(path.join(...p))

let somedata = ''

class LightningClient extends EventEmitter {
    constructor(rpcPath=defaultRpcPath) {
        if (!path.isAbsolute(rpcPath)) {
            throw new Error('The rpcPath must be an absolute path');
        }
        
        if (!fExists(rpcPath){
            // network directory provided, use the lightning-rpc within in
            if (fExists(rpcPath, 'lightning-rpc')) {
            rpcPath = path.join(rpcPath, 'lightning-rpc');
            }
        
            // main data directory provided, default to using the bitcoin mainnet subdirectory
            else if (fExists(rpcPath, 'bitcoin', 'lightning-rpc')) {
            console.error(`WARN: ${rpcPath}/lightning-rpc is missing, using the bitcoin mainnet subdirectory at ${rpcPath}/bitcoin instead.`)
            console.error(`WARN: specifying the main lightning data directory is deprecated, please specify the network directory explicitly.\n`)
            rpcPath = path.join(rpcPath, 'bitcoin', 'lightning-rpc')
            }
            
            else if (fExists(rpcPath, 'testnet', 'lightning-rpc')) {
            console.error(`WARN: ${rpcPath}/lightning-rpc is missing, using the bitcoin mainnet subdirectory at ${rpcPath}/bitcoin instead.`)
            console.error(`WARN: specifying the main lightning data directory is deprecated, please specify the network directory explicitly.\n`)
            rpcPath = path.join(rpcPath, 'testnet', 'lightning-rpc')
            }
        }

        debug(`Connecting to ${rpcPath}`);

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
                debug(`Lightning client connected`);
                _self.reconnectWait = 1;
                resolve();
            });

            _self.client.on('end', () => {
                global.logger.error('Lightning client connection closed, reconnecting');
                _self.increaseWaitTime();
                _self.reconnect();
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
            debug('Trying to reconnect...');

            _self.client.connect(_self.rpcPath);
            _self.reconnectTimeout = null;
        }, this.reconnectWait * 1000);
    }

    call(method, args = []) {
        const _self = this;

        const callInt = ++this.reqcount;
        const sendObj = {
            method,
            params: args,
            id: ''+callInt
        };

        debug('#%d --> %s %o', callInt, method, args)

        // Wait for the client to connect
        return this.clientConnectionPromise
            .then(() => new Promise((resolve, reject) => {
                // Wait for a response
                this.once('res:' + callInt, res => res.error == null
                  ? resolve(res.result)
                  : reject(LightningError(res.error))
                );

                // Send the command
                _self.client.write(JSON.stringify(sendObj));
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
