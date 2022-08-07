### C-Lightning Commands Covered with the APIs

=== bitcoin ===
- [x] feerates
- [ ] fundpsbt
- [ ] multiwithdraw
- [x] newaddr
- [ ] reserveinputs
- [ ] sendpsbt
- [ ] signpsbt
- [ ] txdiscard
- [ ] txprepare
- [ ] txsend
- [ ] unreserveinputs
- [ ] utxopsbt
- [x] withdraw

=== channels ===
- [x] close
- [x] fundchannel (as channel/openChannel)
- [ ] fundchannel_cancel
- [ ] fundchannel_complete
- [ ] fundchannel_start
- [x] funderupdate (experimental-dual-fund required)
- [x] getroute
- [x] listchannels
- [x] listforwards
- [ ] multifundchannel
- [ ] openchannel_abort
- [ ] openchannel_bump
- [ ] openchannel_init
- [ ] openchannel_signed
- [ ] openchannel_update
- [ ] setchannel
- [x] setchannelfee

=== datastore ===
- [x] datastore
- [x] deldatastore
- [x] listdatastore

=== network ===
- [ ] addgossip
- [x] connect
- [x] disconnect
- [x] listnodes
- [x] listpeers
- [ ] ping
- [ ] sendcustommsg

=== onions (experimental-onion-messages required) ===
- [ ] sendonionmessage

=== offers (experimental-offers required) ===
- [x] disableoffer
- [x] fetchinvoice
- [x] listoffers
- [x] offer
- [ ] offerout
- [ ] sendinvoice

=== payment ===
- [ ] createinvoice
- [ ] createonion
- [x] decode
- [x] decodepay
- [x] delexpiredinvoice
- [x] delinvoice
- [ ] delpay
- [x] invoice
- [x] listinvoices
- [x] listsendpays (as pay/listPayments)
- [ ] listtransactions
- [ ] sendonion
- [ ] sendpay
- [ ] waitanyinvoice
- [x] waitinvoice
- [ ] waitsendpay

=== plugin ===
- [ ] autocleaninvoice
- [x] estimatefees
- [x] fundchannel
- [ ] getchaininfo
- [ ] getrawblockbyheight
- [ ] getutxout
- [x] keysend
- [ ] legacypay
- [x] listpays
- [x] pay
- [ ] paystatus
- [ ] plugin
- [ ] sendrawtransaction

=== utility ===
- [ ] check
- [x] checkmessage
- [x] getinfo
- [ ] getlog
- [ ] getsharedsecret
- [ ] help
- [x] listconfigs
- [x] listfunds
- [ ] notifications
- [ ] parsefeerate
- [x] signmessage
- [ ] stop
- [ ] waitblockheight

=== custom ===
- [x] user-enabled RPC commands via /rpc

=== developer (developer mode required) ===   
- [ ] dev-listaddrs
- [ ] dev-rescan-outputs