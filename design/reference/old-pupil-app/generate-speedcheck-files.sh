#!/bin/bash

mkdir -p ./public/data

# Generate text files suitable for use when downloading via ajax for a speed check.
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 134217728 > public/data/128mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 67108864 > public/data/64mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 33554432 > public/data/32mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 16777216 > public/data/16mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 8388608 > public/data/8mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 4194304 > public/data/4mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 2097152 > public/data/2mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 1048576 > public/data/1mb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 524288 > public/data/512kb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 262144 > public/data/256kb.text
LC_CTYPE=C < /dev/urandom tr -dc "[:alnum:]" | head -c 131072 > public/data/128kb.text

set -x
ls -al ./public/data/
