# c-lightning-REST
REST APIs for c-lightning written in Node.js

In early stages of development, not ready for prime time!

## Pre-requisite
A full node running c-lightning

## APIs available:
- getinfo - Get node information
- newaddr - Generate address for recieving on-chain funds
- listfunds - Returns on-chain funds and channel funds information
- getbalance - Returns total, confirmed and unconfirmed on-chain balances
- localremotebal - Summarizes local and remote channel balances on the node
- getfees - Returns the routing fee collected by the node
- withdraw - Withdraw on-chain funds to an address
- connect - Connect with a network peer
- listpeers - Returns the list of peers connected with the node

PRs are welcome! :-)
