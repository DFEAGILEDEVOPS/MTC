#!/bin/sh

# Always re-generate the config based on the env variables
sh gen_config.sh && mv config.json /usr/share/nginx/html/public

# Start nginx
nginx -g 'daemon off;'
