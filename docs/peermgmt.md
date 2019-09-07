Please use this documentation for understanding the API params and responses only.
For detailed understanding of all aspects, please refer to c-lightning [repo](https://github.com/ElementsProject/lightning) or view the help pages on your node.

Help command example: `$ lightning-cli help getinfo`

*Required params are route params. Optional params are query params*

*For POST APIs all params will be passed in the body as a JSON*

## Peer management API documentation
[Back to Readme](../README.md)

### connect
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/peer/connect`
- Required Params: id (Pubkey of the peer)
- Optional Params: None
- Response:
"id"

### listpeers
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/peer/listPeers`
- Required Params: None
- Optional Params: None
- Response:
"id", "connected", "netaddr" [`<address>`] (if `connected` is false, `netaddr` is not returned)

### disconnect
- Type: `DEL`
- Sample request URL: `https://localhost:3001/v1/peer/disconnect`
- Required Params: Node Pubkey
- Optional Params: `force` (`true` or `1`)
- Response: NA