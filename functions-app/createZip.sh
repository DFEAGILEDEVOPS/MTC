#!/bin/sh
zip -ru ../functions-app-debug.zip . \
-x '.env' \
-x '.gitignore' \
-x '.nvmrc' \
-x '.nyc_output/*' \
-x 'coverage/*' \
-x 'local.settings.json' \
-x 'node_modules/.cache/*' \
-x '*/PS-REPORT-OUTPUT-V2*' \
-x '*/PS-REPORT-EXTRACT-TEMP*' \
-x '.env' \
-x '*/.env'
