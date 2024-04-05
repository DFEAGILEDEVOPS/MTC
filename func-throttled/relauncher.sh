#!/bin/bash
set -x
: > func.out

func_one() {
   RESULT=$(func host start --port 7073 | tee >(cat >&2) | tail -1)
   echo $RESULT
}

while ! `func_one | tee -a func.out`
do
    sleep 1
    echo "Restarting..."
done
