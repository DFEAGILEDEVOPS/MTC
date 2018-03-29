#!/bin/bash
set -e


docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d
# get test container output while they run 
docker logs -f admin_tests
docker logs -f pupil_tests
# capture test container exit codes
ADMIN_RETURN_CODE=$(docker wait admin_tests)
PUPIL_RETURN_CODE=$(docker wait pupil_tests)

docker-compose -f docker-compose.yml -f docker-compose.test.yml down

echo "admin code: $ADMIN_RETURN_CODE"
echo "pupil code: $PUPIL_RETURN_CODE"
# return non-zero exit code if either container failed
if [ $ADMIN_RETURN_CODE -ne 0 ]
then
  exit $ADMIN_RETURN_CODE
fi

if [ $PUPIL_RETURN_CODE -ne 0 ]
then
  exit $PUPIL_RETURN_CODE
fi

exit 0
