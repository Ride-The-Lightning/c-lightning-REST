Please use this documentation for understanding the API params and responses only.
For detailed understanding of all aspects, please refer to c-lightning [repo](https://github.com/ElementsProject/lightning) or view the help pages on your node.

Help command example: `$ lightning-cli help getinfo`

*Required params are route params. Optional params are query params.*

## Invoice API documentation
[Back to Readme](../README.md)

### invoice
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/invoice/genInvoice/`
- Required Params: Amount(msats), label, description
- Optional Params: expiry(seconds), private(`true` or `1`)
- Response:
"payment_hash", "expires_at", "bolt11"

### listinvoices
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/invoice/listInvoices/`
- Required Params: None
- Optional Params: label
- Response:
"invoices" [{ "label", "bolt11", "payment_hash", "msatoshi", "amount_msat", "status", "pay_index", "msatoshi_received", "amount_received_msat", "paid_at", "description", "expires_at" }]

### delexpiredinvoice
- Type: `DEL`
- Sample request URL: `https://localhost:3001/v1/invoice/delExpiredInvoice/`
- Required Params: None
- Optional Params: maxexpiry(epoch time)
- Response: NA