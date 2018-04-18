#!/bin/bash
set -e


docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml build
docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml up -d pupil-app
docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml up pupil-tests

# capture test container exit codes
PUPIL_RETURN_CODE=$(docker wait pupil_tests_2)

docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml down

echo "pupil code: $PUPIL_RETURN_CODE"
# return non-zero exit code if either container failed

if [ $PUPIL_RETURN_CODE -ne 0 ]
then
  exit $PUPIL_RETURN_CODE
fi

exit 0
