#!/bin/sh
set -e

cat <<-EOF > "cl-rest-config.json"
{
	"PORT": $PORT,
	"DOCPORT": $DOCPORT,
	"PROTOCOL": "$PROTOCOL",
	"EXECMODE": "$EXECMODE"
}
EOF

node cl-rest.js
