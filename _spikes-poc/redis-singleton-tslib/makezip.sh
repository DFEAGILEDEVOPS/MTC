#!/bin/sh

zip -ru ../deploy.zip . \
-x '.env' \
-x '.gitignore' \
-x '.nvmrc' \
-x '.nyc_output/*' \
-x 'coverage/*' \
-x 'local.settings.json' \
-x 'node_modules/.cache/*' \
-x '.env' \
-x '*/.env'
