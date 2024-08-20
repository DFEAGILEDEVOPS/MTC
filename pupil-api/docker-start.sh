#!/bin/sh

echo "Starting SSH..."
/usr/sbin/sshd

echo "Starting PM2..."
pm2-docker start pm2.json
