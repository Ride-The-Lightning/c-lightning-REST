# c-lightning-REST
REST APIs for c-lightning written in Node.js

In early stages of development, not ready for prime time!

## Pre-requisite
A full node running c-lightning

## APIs available:
### General Node info
- getinfo - Get node information
- listfunds - Returns on-chain funds and channel funds information
- getbalance - Returns total, confirmed and unconfirmed on-chain balances
- getfees - Returns the routing fee collected by the node
- localremotebal - Summarizes local and remote channel balances on the node
### On-Chain fund management
- newaddr - Generate address for recieving on-chain funds
- withdraw - Withdraw on-chain funds to an address
### Peer management
- connect - Connect with a network peer
- listpeers - Returns the list of peers connected with the node
### Channel management
- fundchannel - Open channel with a connected peer node
- getchannels - Get the list of channels open on the node
- setchannelfee - Update the fee policy for a channel
- close - Close channel

PRs are welcome! :-)
