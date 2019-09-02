## Channel management API documentation
[Back to Readme](../README.md)

### fundchannel
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/channel/openChannel/`
- Required Params: Pubkey, Amount in Sats
- Optional Params: None
- Response: NA

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
- Required Params: Channel ID
- Optional Params: Base Rate, PPM Rate
- Response: NA

### close
- Type: `DEL`
- Sample request URL: `https://localhost:3001/v1/channel/closeChannel/`
- Required Params: Channel ID
- Optional Params: Force close flag, Timeout in seconds
- Response:
"tx", "txid", "type"

### listforwards
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/channel/listForwards/`
- Required Params: None
- Optional Params: None
- Response:
"in_channel", "out_channel", "in_msatoshi", "in_msat", "out_msatoshi", "out_msat", "fee", "fee_msat", "status"