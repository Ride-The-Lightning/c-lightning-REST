## Payments API documentation
[Back to Readme](../README.md)

### pay
- Type: `POST`
- Sample request URL: `https://localhost:3001/v1/pay/`
- Required Params: Bolt11 invoice
- Optional Params: None
- Response:
"id", "payment_hash", "destination", "msatoshi", "amount_msat", "msatoshi_sent", "amount_sent_msat", "created_at", "status", "payment_preimage", "bolt11"

### listpays
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/pay/listPays/`
- Required Params: None
- Optional Params: Bolt11 invoice
- Response:
"pays" [{ "bolt11", "status", "payment_preimage", "amount_sent_msat" }]

### listpayments
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/pay/listPayments/`
- Required Params: None
- Optional Params: Bolt11 invoice
- Response:
"payments" [{ "id", "payment_hash", "destination", "msatoshi", "amount_msat", "msatoshi_sent", "amount_sent_msat", "created_at", "status", "payment_preimage", "bolt11" }]

### decodepay
- Type: `GET`
- Sample request URL: `https://localhost:3001/v1/pay/decodePay/`
- Required Params: Bolt11 invoice
- Optional Params: None
- Response:
"currency", "created_at", "expiry", "payee", "msatoshi", "amount_msat", "description", "min_final_cltv_expiry", "payment_hash", "signature"