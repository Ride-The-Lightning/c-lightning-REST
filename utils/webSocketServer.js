const crypto = require('crypto');
const WebSocket = require ('ws');
const macaroon = require('macaroon');

const pingInterval = setInterval(() => {
    global.logger.log('Terminating inactive WS clients at ' + new Date());
    if (wss.clients.size && wss.clients.size > 0) {
        wss.clients.forEach((client) => {
            if (client.isAlive === false) { return client.terminate(); }
            client.isAlive = false;
            client.ping();
        });
    }
}, 1000 * 60 *60); //An hour

const generateAcceptValue = (acceptKey) => crypto.createHash('sha1').update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');

const verifyWSClient = (info, next) => {
    try {
        const protocols = !info.req.headers['sec-websocket-protocol'] ? [] : info.req.headers['sec-websocket-protocol'].split(',').map((s) => s.trim());
        let mac = !protocols[0] ? '': protocols[0];
        if(protocols[1] && protocols[1] === 'hex') { 
            mac = Buffer.from(mac, 'hex').toString('base64');
        }
        macaroon.importMacaroon(macaroon.base64ToBytes(mac)).verify(verRootkey, () => null, []);
        next(true);
    } catch (error) {
        next(false, 401, 'Authentication Failed! Bad Macaroon!');
    }
};

const wss = new WebSocket.Server({ noServer: true, path: '/v1/ws', verifyClient: () => (config.EXECMODE === 'test') ? true : verifyWSClient });

exports.mountWebServer = (httpServer) => {
    try {
        httpServer.on('upgrade', (request, socket, head) => {
            if (request.headers['upgrade'] !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
            const acceptKey = request.headers['sec-websocket-key'];
            const hash = generateAcceptValue(acceptKey);
            const responseHeaders = ['HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', 'Sec-WebSocket-Accept: ' + hash];
            const protocols = !request.headers['sec-websocket-protocol'] ? [] : request.headers['sec-websocket-protocol'].split(',').map((s) => s.trim());
            if (protocols.includes('json')) {
                responseHeaders.push('Sec-WebSocket-Protocol: json');
            }
            wss.handleUpgrade(request, socket, head, (websocket, request) => {
                wss.emit('connection', websocket, request);
            });
        });
        wss.on('close', () => { clearInterval(pingInterval); });
        wss.on('connection', (websocket, request) => {
            websocket.clientID = Date.now();
            websocket.isAlive = true;
            global.logger.log("Client connected with websocket, total clients: " + wss.clients.size);
            websocket.on('error', (err) => {
                global.logger.warn("Error from websocket: ");
                global.logger.warn(err);
            });
            websocket.on('message', this.broadcastToClients);
            websocket.on('pong', () => { websocket.isAlive = true; });
            websocket.on('close', () => { 
                global.logger.warn("Client disconnected, total clients: " + wss.clients.size); 
            });
        });
        this.listInvoicesToSubscribe();
    } catch (error) {
        global.logger.warn(error);
        throw new Error(error);
    }
}

exports.listInvoicesToSubscribe = () => {
    ln.listinvoices().then(data => {
        const max_pay_index = Math.max(...data.invoices.map(inv => inv.pay_index || 0));
        global.logger.log('Maximum pay index to subscribe -> ' + max_pay_index);
        this.subscribeToAnyInvoice(max_pay_index);
    }).catch(err => {
        global.logger.warn(err);
        throw new Error(err);
    });
}

exports.subscribeToAnyInvoice = (last_index) => {
    function connFailed(err) { throw err }
    ln.on('error', connFailed);

    ln.waitanyinvoice(last_index).then(invUpdate => {
        global.logger.log('Received Invoice Update: ' + JSON.stringify(invUpdate));
        this.broadcastToClients({event: 'invoice', data: invUpdate});
        this.subscribeToAnyInvoice(invUpdate.pay_index);
    }).catch(err => {
        global.logger.warn(err.stack || err.toString());
        setTimeout(() => this.subscribeToAnyInvoice(last_index), 10000);
    });

    ln.removeListener('error', connFailed);
};

exports.broadcastToClients = (newMessage) => {
    try {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                global.logger.log('Broadcasting new message: ');
                global.logger.log(JSON.stringify(newMessage));
                client.send(JSON.stringify(newMessage));
            }
        })
    } catch (err) {
        global.logger.warn(err);
        throw new Error(err);
    }
};
