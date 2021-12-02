# C-Lightning-REST
REST APIs for c-lightning written in Node.js
![](screenshots/Swagger-example-v2.png)

Docker image: https://hub.docker.com/repository/docker/saubyk/c-lightning-rest

* [Setup](#setup)
    * [Pre-requisite](#prereq)
    * [Installation](#install)
    * [Config](#config)
    * [Execute](#exec)
    * [Security](#sec)
    * [Authentication](#auth)
* [API Documentation](#apis)

## <a name="setup"></a>Setup
### <a name="prereq"></a>Pre-requisite
* A node running [c-lightning](https://github.com/ElementsProject/lightning)
* Node.js, which can be downloaded [here](https://nodejs.org/en/download/)

### <a name="install"></a>Installation
Download a specific version by following the instructions on the [release page](https://github.com/Ride-The-Lightning/c-lightning-REST/releases)

Download from master (*not recommended*), by following the below steps:
```
$ git clone https://github.com/saubyk/c-lightning-REST
$ cd c-lightning-REST
$ npm install
```
### <a name="config"></a>Configuration parameters
The below run time configuration are available, which can be configured either via library specific config file or C-Lightning `config` file:
- Port - Port for serving the APIs
- Documentation port - Port for serving the swagger documentation
- Protocol - Http protocol for communication with the REST server. Two options are supported `https` and `http`(unencrypted and insecure communication between API server and the app)
- Execution mode - Control for more detailed log info. The options supported are `test` and `production`
- Lightning-RPC Path - Configure the path where `lightning-rpc` file is located. It will default to standard lightning path if not configured
- RPC Command -  - Enable additional RPC commands for `/rpc` endpoint
- Domain - An external domain to be used for the self-signed certificate

#### Option 1: Via Config file `cl-rest-config.json`
For running the server, rename the file `sample-cl-rest-config.json` to `cl-rest-config.json`. Following parameters can be configured in the config file:
- PORT (Default: `3001`)
- DOCPORT (Default: `4001`)
- PROTOCOL (Default: `https`)
- EXECMODE (Default: `production`)
- LNRPCPATH (Default: ` `)
- RPCCOMMANDS (Default: `["*"]`)
- DOMAIN (Default: `localhost`)

#### Option 2: With the plugin configuration, if used as a plugin
If running as a plugin, configure the below options in your c-lightning `config` file:
- `rest-port`
- `rest-docport`
- `rest-protocol`
- `rest-execmode`
- `rest-lnrpcpath`
- `rest-rpc`
- `rest-domain`

Defaults are the same as in option # 1 with the exception that `rest-rpc` is a comma separated string.

### <a name="exec"></a>Execute Server
You can choose from the below options to run the API server

#### Option 1: Run as an API server
`$ node cl-rest.js`

Access the APIs on the default port 3001 or the port configured in the config file.

#### Option 2: Run as c-lightning plugin
Pass arguments when launching lightningd:

`$ lightningd --plugin=PATH_TO_PLUGIN [--rest-port=N] [--rest-protocol=http|https] [--rest-execmode=MODE]`

E.g. `$ lightningd --plugin=/Users/<user>/c-lightning-REST/plugin.js --rest-port=3003`

OR

Set `plugin`, `[rest-port]`, `[rest-docport]`, `[rest-protocol]`, and `[rest-execmode]` in lightningd [config](https://github.com/ElementsProject/lightning/blob/master/doc/lightningd-config.5.md)

E.g. add below to the `config` file in `.lightning` folder
```
plugin=/Users/<user>/c-lightning-REST/plugin.js
rest-port=3002
rest-docport=4001
rest-protocol=https
```
#### Option 3: Running c-lightning-REST as a service (Rpi or Linux platform users)
In case you are running a headless Rpi or a Linux node, you can configure c-lightning-REST as a service.

* Create c-lightning-REST systemd unit and with the following content. Save and exit.
```bash
# Raspibolt c-lightning-REST: systemd unit for c-lightning-REST
# /etc/systemd/system/c-lightning-REST.service

[Unit]
Description=c-lightning-REST daemon
Wants=lightningd.service
After=lightningd.service

[Service]
ExecStart=/usr/bin/node <Full path of the c-lightning-REST folder>/cl-rest.js
User=<user>
Restart=always
TimeoutSec=120
RestartSec=30

[Install]
WantedBy=multi-user.target
```

* enable and start c-lightning-REST
```
$ sudo systemctl enable c-lightning-REST
$ sudo systemctl start c-lightning-REST
```
* montior the c-lightning-REST log file in realtime(exit with Ctrl-C)

`$ sudo journalctl -f -u c-lightning-REST`

### <a name="sec"></a>Security
With the default config, APIs will be served over `https` (a self signed certificate and key will be generated in the certs folder with openssl).

Sample url: `https://localhost:3001/v1/getinfo/`

Providing a `DOMAIN` to the c-lightning-REST configuration will add the domain as a `subjectAltName` to the openssl certificate, permitting successful certificate validation by users and applications, e.g. Zeus, when connecting to the server at via that domain.

If you are *upgrading* a server which is already configured, you should first backup and your entire `./certs` directory in case you need to restore it later.
Following this you should delete *only* the `.certs/certificate.pem` and `.certs/key.pem` files, so that new SSL certificates can be generated which take the `subjectAltName` into consideration.

**WARNING**: Do not delete `access.macaroon`. If you do then your connection to remote applications will be lost, and need to be re-configured.

New certificates will be automatically generated as usual next time the program is started up.

### <a name="auth"></a>Authentication
Authentication has been implemented with macaroons. Macaroons are bearer tokens, which will be verified by the server.
A file `access.macaroon` will be generated in the `certs` folder in the application root.
The `access.macaroon` has to be read by the requesting application, converted to `base64` or `hex`, and passed in the header with key value `macaroon`.

Encoding Options for passing macaroon in the header:
#### Option 1 - base64
* Request header:
`macaroon` set as the macaroon coverted to base64 string.
* Sample code to convert macaroon to base64 string:
 ```
 var abc = fs.readFileSync (macaroonFile);
 var macaroon = Buffer.from(abc).toString("base64");
 ```
#### Option 2 - hex
* Request header:
`macaroon` set as the macaroon coverted to hex string and `encodingtype` with value set as `hex`
* Sample code to convert macaroon to hex string:
 ```
 var abc = fs.readFileSync (macaroonFile);
 var macaroon = Buffer.from(abc).toString("hex");
 ```
If you need help converting your macaroon to hex format you can use the Node.js script from the Zeus project, found [here](https://github.com/ZeusLN/lnd-hex-macaroon-generator/). Alternatively, if you're running a Unix-based operating system (eg. macOS, Linux) you can run `xxd -ps -u -c 1000 /path/to/access.macaroon` to generate your macaroon in hex format.

## <a name="apis"></a>API Documentation
***Sample url for Swagger documentation of APIs: http://localhost:4001/api-docs/***

C-Lightning commands covered by this API suite is [here](docs/CLTCommandCoverage.md)

### General Node info
- getinfo (/v1/getinfo) - `GET`: Get node information
- listfunds (/v1/listFunds) - `GET`: Returns on-chain funds and channel funds information
- getbalance (/v1/getBalance) - `GET`: Returns total, confirmed and unconfirmed on-chain balances
- getfees (/v1/getFees) - `GET`: Returns the routing fee collected by the node
- signmessage (/v1/utility/signMessage) - `POST`: Creates a digital signature of the message using node's secret key
- verifymessage(/v1/utility/verifyMessage) - `GET`: Verifies a signature and the pubkey of the node which signed the message
- decode (/v1/utility/decode) - `GET`: Decodes various invoice strings including BOLT12
### On-Chain fund management
- newaddr (/v1/newaddr) - `GET`: Generate address for recieving on-chain funds
- withdraw (/v1/withdraw) - `POST`: Withdraw on-chain funds to an address
### Peer management
- connect (/v1/peer/connect) - `POST`: Connect with a network peer
- listpeers (/v1/peer/listPeers) - `GET`: Returns the list of peers connected with the node
- disconnect (/v1/peer/disconnect) - `DEL`: Disconnect from a connected network peer
### Channel management
- fundchannel (/v1/channel/openChannel) - `POST`: Open channel with a connected peer node
- listchannels (/v1/channel/listChannels) - `GET`: Get the list of channels open on the node
- setchannelfee (/v1/channel/setChannelFee) - `POST`: Update the fee policy for a channel
- close (/v1/channel/closeChannel) - `DEL`: Close channel
- listforwards (/v1/channel/listForwards) - `GET`: Get the list of forwarded htlcs by the node
- localremotebal (/v1/channel/localremotebal) - `GET`: Summarizes local and remote channel balances on the node
### Payments
- pay (/v1/pay) - `POST`: Pay a bolt11 invoice
- listpays (/v1/pay/listPays) - `GET`: List result of payment {bolt11}, or all
- listsendpays (/v1/pay/listPayments) - `GET`: List outgoing payments {bolt11}, or all. This api has more detailed output than listpays
- decodepay (/v1/pay/decodePay) - `GET`: Decode the bolt11 invoice
- keysend (/v1/pay/keysend) - `POST`: Send funds to a node without an invoice
### Invoice
- invoice (/v1/invoice/genInvoice) - `POST`: Generates a bolt11 invoice provided amount in msat, label, description, expiry in seconds (optional)
- listinvoices (/v1/invoice/listInvoices) - `GET`: Lists the invoice on the node, for a {label} or all.
- delexpiredinvoice (v1/invoice/delExpiredInvoice) - `DEL`: Delete expired invoices.
- delinvoice (v1/invoice/delInvoice) - `DEL`: Delete a particular invoice with a label and status.
### Network
- getroute (/v1/network/getRoute) - `GET`: List the best route for the payment of [msatoshi] to a lightning node [id]
- listnodes (/v1/network/listNode) - `GET`: Lookup node info from the network graph, for a given [pubkey]
- listchannels (/v1/network/listChannel) - `GET`: Lookup channel info from the network graph, for a given [short_channel_id]
- feerates (/v1/network/feeRates) - `GET`: Lookup fee rates on the network, for a given rate style (`perkb` or `perkw`)
- estimatefees (/v1/network/estimateFees) - `GET`: Get the urgent, normal and slow Bitcoin feerates as sat/kVB.

### Offers
- offer (/v1/offers/offer) - `POST`: Create an offer
- listoffers (/v1/offers/listOffers) - `GET`: Returns a list of all the offers on the node
- fetchinvoice (/v1/offers/fetchInvoice) - `POST`: Fetch an invoice for an offer
- disableoffer (v1/offers/disableOffer) - `DEL`: Disables an existing offer, so that it cannot be used for future payments

### RPC
- rpc (/v1/rpc) - `POST`: additional access to RPC comands. Examples of body param for rpc:
#### No param
`{"method": "getinfo}`
#### One param
`{"method":"signmessage", "params": ["message"]}`
#### Multiple params
`{"method":"mymethod", "params: {"key1": "value1"...}}`

PRs are welcome! :-)
