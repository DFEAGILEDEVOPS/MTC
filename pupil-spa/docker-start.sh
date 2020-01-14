#!/bin/sh

# start ssh
/usr/sbin/sshd

# Always re-generate the config based on the env variables
sh gen_config.sh && mv config.json /usr/share/nginx/html/public

# Update the account name used for the nginx azure proxy
/bin/sed -i "s/<azure_account_name>/${AZURE_ACCOUNT_NAME}/g" /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
