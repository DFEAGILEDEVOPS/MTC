#!/bin/bash
set -e

# Wrap docker-compose and return a non-zero exit code if any containers failed.

docker-compose -f docker-compose.yml -f docker-compose.test.yml $@
ADMIN_RETURN_CODE=$(docker wait admin_tests)
PUPIL_RETURN_CODE=$(docker wait pupil_tests)

echo "admin code: $ADMIN_RETURN_CODE"
echo "pupil code: $PUPIL_RETURN_CODE"

if [ $ADMIN_RETURN_CODE -ne 0 ]
then
  exit $ADMIN_RETURN_CODE
fi

if [ $PUPIL_RETURN_CODE -ne 0 ]
then
  exit $PUPIL_RETURN_CODE
fi

exit 0
