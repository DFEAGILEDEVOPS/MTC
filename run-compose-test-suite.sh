#!/bin/bash
set -e

# Wrap docker-compose and return a non-zero exit code if any containers failed.

docker-compose -f docker-compose.yml -f docker-compose.test.yml $@

CODE=$(docker-compose -f docker-compose.yml -f docker-compose.test.yml ps -q | xargs docker inspect -f '{{ .State.ExitCode }}' | grep -v 0 | wc -l | tr -d '[:space:]')
echo "exit code is: $CODE"
exit $CODE
