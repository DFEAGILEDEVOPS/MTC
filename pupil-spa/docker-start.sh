#!/bin/sh

# start ssh
/usr/sbin/sshd

# Always re-generate the config based on the env variables
./gen_config.sh && mv config.json /usr/share/nginx/html/assets

# Update the account name used for the nginx azure proxy
/bin/sed -i "s/<azure_account_name>/${AZURE_ACCOUNT_NAME}/g" /etc/nginx/conf.d/default.conf

# update the unsupported browser page with the app insights instrumentation key
/bin/sed -i "s/<instrumentation_key>/${APPINSIGHTS_INSTRUMENTATIONKEY}/g" /etc/nginx/html/unsupported/browser.html

# Start nginx
nginx -g 'daemon off;'
