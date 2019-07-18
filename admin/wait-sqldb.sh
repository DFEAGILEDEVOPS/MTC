#!/bin/bash

if [[ "${WAIT_FOR_SQL_SERVER:=false}" != "false" ]]; then
  echo "Waiting for $SQL_SERVER:$SQL_PORT to be available..."

  until [[ "$(curl -sS $SQL_SERVER:$SQL_PORT 2>/dev/stdout)" =~ "(52)" ]]; do
    printf '.'
    sleep 5
  done
fi