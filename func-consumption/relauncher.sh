#!/bin/bash

# USAGE: './relauncher.sh'
#
# This is an optional wrapper that can used by developers and testers to keep the `func` process
# running.  If it detects a non-zero exit code it will start it again.  I use it when func is giving
# me grief on the end-to-end tests.
#

# verbose: show commands
set -x

# truncate file func.out
: > func.out

func_one() {
   RESULT=$(func start | tee -a func.out | tee >(cat >&2) | tail -1)
   echo $RESULT
}

while ! `func_one`
do
    sleep 1
    echo "Restarting..."
done
