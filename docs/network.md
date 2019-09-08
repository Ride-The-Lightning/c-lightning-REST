Please use this documentation for understanding the API params and responses only.
For detailed understanding of all aspects, please refer to c-lightning [repo](https://github.com/ElementsProject/lightning) or view the help pages on your node.

Help command example: `$ lightning-cli help getinfo`

*Required params are route params. Optional params are query params.*

## Network API documentation
[Back to Readme](../README.md)

### getroute
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/network/getRoute/`
- Required Params: Pubkey, Amount(msats)
- Optional Params: `riskFactor`(Default value is 0)
- Response:
[{ "id", "channel", "direction", "msatoshi", "amount_msat", "delay", "alias" }]

### listnodes
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/network/listNode/`
- Required Params: Pubkey
- Optional Params: None
- Response:
[{ "nodeid", "alias", "color", "last_timestamp", "globalfeatures", "global_features", "addresses" [{ "type", "address", "port" }] }]

### listchannels
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/network/listChannel/`
- Required Params: Short Channel ID
- Optional Params: None
- Response:
[{ "source", "destination", "short_channel_id", "public", "satoshis", "amount_msat", "message_flags", "channel_flags", "flags", "active", "last_update", "base_fee_millisatoshi", "fee_per_millionth", "delay"}]

### feerates
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/network/feeRates/`
- Required Params: Fee rate style (`perkw` or `perkb`)
- Optional Params: None
- Response:
"perkb" :{"urgent", "normal", "slow", "min_acceptable", "max_acceptable"}, "onchain_fee_estimates" :{"opening_channel_satoshis", "mutual_close_satoshis", "unilateral_close_satoshis"}