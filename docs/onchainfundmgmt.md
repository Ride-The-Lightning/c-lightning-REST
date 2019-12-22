Please use this documentation for understanding the API params and responses only.
For detailed understanding of all aspects, please refer to c-lightning [repo](https://github.com/ElementsProject/lightning) or view the help pages on your node.

Help command example: `$ lightning-cli help getinfo`

***Sample url for Swagger documentation of APIs: http://localhost:4001/api-docs/***

*Required params are route params. Optional params are query params.*

*For POST APIs all params will be passed in the body*

## On-Chain fund management API documentation
[Back to Readme](../README.md)

### newaddr
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/newaddr`
- Required Params: None
- Optional Params: `addrType` (`bech32` or `p2sh-segwit`)
- Response:
"address"

### withdraw
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/withdraw`
- Required Params: `address`(Any Bitcoin accepted type, including bech32), `satoshis`
- Optional Params: `feeRate`(review c-lightning documentation for the options), `minconf`
- Response:
"tx", "txid"