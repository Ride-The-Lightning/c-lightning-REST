## Peer management API documentation
[Back to Readme](../README.md)

### connect
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/peer/connect`
- Required Params: Node Pubkey
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