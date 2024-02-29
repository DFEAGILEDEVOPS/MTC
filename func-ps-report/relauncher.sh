#!/bin/bash
set -x
: > func.out

func_one() {
   RESULT=$(func host start --port 7074 | tee -a func.out | tee >(cat >&2) | tail -1)
   echo $RESULT
}

while ! `func_one`
do
    sleep 1
    echo "Restarting..."
done
