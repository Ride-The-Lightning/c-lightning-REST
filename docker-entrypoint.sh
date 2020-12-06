#!/bin/sh
set -e

cat <<-EOF > "cl-rest-config.json"
{
	"PORT": $PORT,
	"DOCPORT": $DOCPORT,
	"PROTOCOL": "$PROTOCOL",
	"EXECMODE": "$EXECMODE",
	"RPCCOMMANDS": "$RPCCOMMANDS"
}
EOF

if [[ "${LIGHTNINGD_READY_FILE}" ]]; then
    echo "Waiting $LIGHTNINGD_READY_FILE to be created..."
    while [ ! -f "$LIGHTNINGD_READY_FILE" ]; do sleep 1; done
    echo "The chain is fully synched"
fi

node cl-rest.js
