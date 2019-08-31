# c-lightning-REST
REST APIs for c-lightning written in Node.js

*IN EARLY STAGES OF DEVELOPMENT. NOT READY FOR PRIME TIME!*

## Pre-requisite
A full node running [c-lightning](https://github.com/ElementsProject/lightning)

### Security
APIs will be served over https (a self signed certificate and key will be generated in the certs folder with openssl)

Sample url: `https://localhost:3001/v1/getinfo/`

### Authentication
Authentication has been implemented with macaroons. Macaroons are bearer tokens, which will be verified by the server.
A file `access.macaroon` will be generated in the `certs` folder in the application root.
The `access.macaroon` has to be read by the requesting application, converted to base64, and passed in the header with key value `macaroon`.

Sample code to generate the base64 macaroon string to be passed in the header:
```
var abc = fs.readFileSync (macaroonFile);
var macaroon = Buffer.from(abc).toString("base64");
```

## APIs available:
### General Node info
- getinfo (/v1/getinfo) - `GET`: Get node information
- listfunds (/v1/listFunds) - `GET`: Returns on-chain funds and channel funds information
- getbalance (/v1/getBalance) - `GET`: Returns total, confirmed and unconfirmed on-chain balances
- getfees (/v1/getFees) - `GET`: Returns the routing fee collected by the node
- localremotebal (/v1/channel/localremotebal) - `GET`: Summarizes local and remote channel balances on the node
### On-Chain fund management
- newaddr (/v1/newaddr) - `GET`: Generate address for recieving on-chain funds
- withdraw (/v1/withdraw) - `POST`: Withdraw on-chain funds to an address
### Peer management
- connect (/v1/peer/connnect) - `POST`: Connect with a network peer
- listpeers (/v1/peer/listPeers) - `GET`: Returns the list of peers connected with the node
### Channel management
- fundchannel (/v1/channel/openChannel) - `POST`: Open channel with a connected peer node
- listchannels (/v1/channel/listChannels) - `GET`: Get the list of channels open on the node
- setchannelfee (/v1/channel/setChannelFee) - `POST`: Update the fee policy for a channel
- close (/v1/channel/closeChannel) - `DEL`: Close channel
### Payments
- pay (/v1/pay) - `POST`: Pay a bolt11 invoice
- listpays (/v1/pay/listPays) - `GET`: List result of payment {bolt11}, or all
- listpayments (/v1/pay/listPayments) - `GET`: List outgoing payments {bolt11}, or all. This api has more detailed output than listpays
- decodepay (/v1/pay/decodePay) - `GET`: Decode the bolt11 invoice
### Invoice
- invoice (/v1/invoice/genInvoice) - `POST`: Generates a bolt11 invoice provided amount in msat, label, description, expiry in seconds (optional)
- listinvoices (/v1/invoice/listInvoices) - `GET`: Lists the invoice on the node, for a {label} or all.
- delexpiredinvoice (v1/invoice/delExpiredInvoice) - `DEL`: Delete expired invoices.

PRs are welcome! :-)