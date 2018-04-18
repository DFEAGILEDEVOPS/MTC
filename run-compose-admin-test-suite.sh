#!/bin/bash
set -e


docker-compose -f docker-compose.yml -f docker-compose.admin-test.yml build
docker-compose -f docker-compose.yml -f docker-compose.admin-test.yml up -d pupil-app
docker-compose -f docker-compose.yml -f docker-compose.admin-test.yml up admin-tests

# capture test container exit codes
ADMIN_RETURN_CODE=$(docker wait admin_tests)

docker-compose -f docker-compose.yml -f docker-compose.admin-test.yml down

echo "admin code: $ADMIN_RETURN_CODE"
# return non-zero exit code if either container failed
if [ $ADMIN_RETURN_CODE -ne 0 ]
then
  exit $ADMIN_RETURN_CODE
fi

exit 0
