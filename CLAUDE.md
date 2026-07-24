# c-lightning-REST

REST APIs for **Core Lightning** (CLN), written in Node.js. Repo:
`Ride-The-Lightning/c-lightning-REST`. This is the backend older RTL releases used to talk
to a CLN node; it is a sibling of `RTL/` (see `../CLAUDE.md` for the RTL family).

Plain **JavaScript, CommonJS** — no TypeScript, no build step, no generated directories.
Everything you edit is what runs.

> **Status: UNMAINTAINED as of 24 July 2026.** `v0.10.8` is the final release (deprecation
> notices only) and the repo is archived read-only. CLN's built-in `clnrest` superseded it;
> every known downstream has migrated (RTL since v0.15.0, plus Zeus, BTCPay Server, Umbrel,
> RaspiBlitz, Polar). **Do not add features or accept behavioral changes here** — the correct
> answer to any request against this codebase is to migrate the caller to clnrest. The
> deprecation notices live in `README.md`, the startup banner in `cl-rest.js`, and the
> Swagger title/description in `docapp.js`; keep them consistent if anything is ever touched.

---

## Two ways it runs

| Entry point | Mode | Config source |
|---|---|---|
| `cl-rest.js` | standalone API server (`node cl-rest.js`) | `cl-rest-config.json` (git-ignored; copy `sample-cl-rest-config.json`) |
| `clrest.js` (symlinked as `c-lightning-REST`) | **CLN plugin** via `clightningjs` | `lightningd` options `rest-port`, `rest-docport`, `rest-protocol`, `rest-execmode`, `rest-rpc`, `rest-lnrpcpath`, `rest-domain`, `rest-bind` |

`app.js` is the branch point: if `global.REST_PLUGIN_CONFIG` is undefined it reads the JSON
config file; otherwise it adopts the plugin config. **Any config change must be made in both
places** — the JSON keys (`PORT`, `DOCPORT`, `PROTOCOL`, `EXECMODE`, `LNRPCPATH`,
`RPCCOMMANDS`, `DOMAIN`, `BIND`), the matching `restPlugin.addOption` in `clrest.js`, the
mapping in `restPlugin.onInit`, `sample-cl-rest-config.json`, `docker-entrypoint.sh`, and the
README's config section.

Under Docker, `docker-entrypoint.sh` *generates* `cl-rest-config.json` from env vars — it
only emits `PORT`/`DOCPORT`/`PROTOCOL`/`EXECMODE`/`RPCCOMMANDS`, so a new option needs adding
there too.

## Layout

```
cl-rest.js               certs + macaroons, https|http server, websocket mount, doc server, signal handling
clrest.js                CLN plugin entry; also forwards CLN notifications to websocket clients
app.js                   express app: CORS, globals (config, logger, appCache, ln), mounts /v1/* routes
docapp.js                second express app on DOCPORT serving Swagger UI at /api-docs
routes/*.js              thin routers: router.<verb>('/path', tasteMacaroon, controller.fn)
controllers/*.js         all logic + the swagger JSDoc blocks that generate the API docs
lightning-client-js.js   unix-socket JSON-RPC client for lightning-rpc (credit: shesek/lightning-client-js)
methods.json             75 CLN method names, attached to the client as camelCase methods
utils/bakeMacaroons.js   mints rootKey + access.macaroon on first boot
utils/tasteMacaroon.js   auth middleware used by every route
utils/utils.js           isVersionCompatible() — CLN version gating
utils/webSocketServer.js /v1/ws server, invoice subscription loop, broadcast
test/mainTest.js         mocha integration tests against a *live* node
docs/                    hand-written per-area docs + CLTCommandCoverage.md
```

`routes/` and `controllers/` are parallel per area (`channel`, `payments`, `invoice`,
`network`, `offers`, `peers`, `peerswap`, `datastore`, `rpc`, …). Routers stay declarative;
put logic in the controller.

## Conventions

- **Controllers are `(req, res)` express handlers** that call `ln.<method>(...)` and return
  `res.status(200).json(...)` / `res.status(500).json({error: err})`. Match the surrounding
  shape, including the `ln.on('error', connFailed)` / `removeListener` bracketing.
- **API docs live in the controller.** `docapp.js` scrapes swagger JSDoc from
  `./controllers/*.js`. A new or changed endpoint means updating its `@swagger` block *and*
  the endpoint list in `README.md` (and the relevant `docs/*.md`).
- **Adding a CLN command**: add the method name to `methods.json` (it becomes
  `ln.someCommand()` via the `protify` camelCase transform), then the controller function,
  then the route.
- Log through `global.logger` (`.log` is test-mode only, `.warn`/`.error` always print) —
  never bare `console.log`. Don't log macaroons, preimages, or seeds.
- Be conservative about new dependencies (security posture); prefer what's already here.
- Releases branch as `Release-v<x.y.z>`; PRs target that branch, not `master` directly.

## Auth & crypto — handle with care

- **Macaroon bearer auth** on every route via `tasteMacaroon`, verified against
  `global.verRootkey`. Client sends header `macaroon` (base64 by default; hex when
  `encodingtype: hex`).
- `certs/` is generated on first boot and git-ignored: `key.pem` + `certificate.pem` (openssl
  self-signed, `DOMAIN` becomes a `subjectAltName`), `access.macaroon`, `rootKey.key`.
  **Deleting `access.macaroon` or `rootKey.key` invalidates every connected client** — the
  certs can be regenerated safely, those two cannot.
- `EXECMODE=test` prints the macaroon (hex + base64) to the log and **disables websocket auth**
  (`verifyClient` short-circuits). It is a dev-only mode; don't extend that pattern.
- `CL_REST_STATE_DIR` overrides the working directory that `certs/` and the config resolve
  against (both `cl-rest.js` and `docapp.js` `chdir` to it).

## WebSocket (`/v1/ws`)

- Auth comes in on `sec-websocket-protocol` (macaroon, optional `hex` marker) — not a header.
- Invoice updates come from a self-rescheduling `waitanyinvoice(last_index)` loop in
  `utils/webSocketServer.js`; on error it retries after 10s only if `global.version` is set.
- As a plugin, `clrest.js` also subscribes to CLN notifications (`connect`, `disconnect`,
  `channel_opened`, `invoice_payment`, `forward_event`, `sendpay_success`, `sendpay_failure`)
  and broadcasts them through the same server.

## CLN version gating

`global.version` is populated in `controllers/getinfo.js` — **so it is unset until a client
calls `/v1/getinfo`**, and version-gated paths fall back to legacy behavior before that.
`utils/utils.js#isVersionCompatible(current, check)` drives the gates: `23.02` for the
msat-field changes (`getBalance`, `getFees`, `localRemoteBal`) and `22.11.1` for offers. Reuse
it rather than parsing versions inline.

## Commands

| Command | Purpose |
|---|---|
| `npm install` | install deps |
| `node cl-rest.js` | run the API server |
| `npm run watch` | nodemon, `NODE_ENV=development` |
| `npm test` | mocha integration suite (needs a live node — see below) |

`npm start` uses Windows syntax (`set NODE_ENV=dev`) and does not work on macOS/Linux; use
`node cl-rest.js` or `npm run watch`.

There is **no linter and no unit-test layer** configured. `test/mainTest.js` reads the real
`cl-rest-config.json` and `certs/access.macaroon` and issues HTTP requests against a running
server, so it requires a live CLN node (regtest) with this server up; it asserts on response
fields, which makes it sensitive to CLN's field renames.

## Docker & CI

Three per-arch Dockerfiles (`amd64.Dockerfile`, `arm32v7.Dockerfile`, `arm64v8.Dockerfile`) —
keep them in sync when changing one. CircleCI (`.circleci/config.yml`) publishes on a pushed
`v*` tag from `master`: build each arch, then stitch a multiarch manifest for
`saubyk/c-lightning-rest`. Branch pushes only run `checkout`.
