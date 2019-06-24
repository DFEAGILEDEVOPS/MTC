#!/bin/bash
set -e

# would ideally use env_file in docker-compose.admin-test.yml, but it passes through the quotes around strings
source ./admin/.env
export APPINSIGHTS_INSTRUMENTATIONKEY AZURE_STORAGE_CONNECTION_STRING SQL_PUPIL_CENSUS_USER_PASSWORD

docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml build
docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml up -d pupil-app functions
docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml up pupil-tests

# capture test container exit codes
PUPIL_RETURN_CODE=$(docker wait pupil_tests)

docker-compose -f docker-compose.yml -f docker-compose.pupil-test.yml down

echo "pupil code: $PUPIL_RETURN_CODE"
# return non-zero exit code if either container failed

if [ $PUPIL_RETURN_CODE -ne 0 ]
then
  exit $PUPIL_RETURN_CODE
fi

exit 0
