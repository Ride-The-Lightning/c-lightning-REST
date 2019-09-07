Please use this documentation for understanding the API params and responses only.
For detailed understanding of all aspects, please refer to c-lightning [repo](https://github.com/ElementsProject/lightning) or view the help pages on your node.

Help command example: `$ lightning-cli help getinfo`

*Required params are route params. Optional params are query params.*

*For POST APIs all params will be passed in the body as a JSON*

## Channel management API documentation
[Back to Readme](../README.md)

### fundchannel
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/channel/openChannel/`
- Required Params: `id`(Public key of the peer), `satoshis` (Amount in sats to fund the channel with)
- Optional Params: `feeRate`(`urgent`, `normal`, `slow`), `announce`(`true` or `false`), `minconf`
- Response: "tx", "txid", "channel_id"

### listchannel
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/channel/listChannels/`
- Required Params: None
- Optional Params: None
- Response:
"peer_id", "connected", "state", "short_channel_id", "channel_id", "funding_txid", "private", "msatoshi_to_us", "msatoshi_total", "their_channel_reserve_satoshis", "our_channel_reserve_satoshis", "spendable_msatoshi"

### setchannelfee
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/channel/setChannelFee/`
- Required Params: `id` (short channel ID, channel id or pubkey)
- Optional Params: `base`(base fee in msat), `ppm`(PPM rate in milli msat)
- Response:
"base", "ppm", "peer_id", "channel_id", "short_channel_id"

### close
- Type: `DEL`
- Sample request URL: `https://localhost:3001/v1/channel/closeChannel/`
- Required Params: Channel ID
- Optional Params: `unilateralTimeout` (in seconds)
- Response:
"tx", "txid", "type"

### listforwards
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/channel/listForwards/`
- Required Params: None
- Optional Params: None
- Response:
"in_channel", "out_channel", "in_msatoshi", "in_msat", "out_msatoshi", "out_msat", "fee", "fee_msat", "status"