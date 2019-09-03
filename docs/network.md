## Network API documentation
[Back to Readme](../README.md)

### getroute
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/network/getRoute/`
- Required Params: Pubkey, Amount(msats)
- Optional Params: Riskfactor (Default value is 0)
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