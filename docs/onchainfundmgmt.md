Please use this documentation for understanding the API params and responses only.
For detailed understanding of all aspects, please refer to c-lightning [repo](https://github.com/ElementsProject/lightning) or view the help pages on your node.

Help command example: `$ lightning-cli help getinfo`

*Required params are route. Optional params are query.*

## On-Chain fund management API documentation
[Back to Readme](../README.md)

### newaddr
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/newaddr`
- Required Params: None
- Optional Params: addrtype (`bech32` or `p2sh-segwit`)
- Response:
"address"

### withdraw
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/withdraw`
- Required Params: Destination Address (Any Bitcoin accepted type, including bech32), Amount in Sats
- Optional Params: None
- Response:
"tx", "txid"