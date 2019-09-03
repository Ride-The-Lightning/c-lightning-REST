## On-Chain fund management API documentation
[Back to Readme](../README.md)

### newaddr
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/newaddr`
- Required Params: None
- Optional Params: Address Type (`bech32` or `p2sh-segwit`)
- Response:
"address"

### withdraw
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/withdraw`
- Required Params: Destination Address (Any Bitcoin accepted type, including bech32), Amount in Sats
- Optional Params: None
- Response:
"tx", "txid"