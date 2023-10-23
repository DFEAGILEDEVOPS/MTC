#!/bin/sh
# This script must run on developer localhost as well as an alpine docker image which does not have /bin/bash
# see the README.md file 'SAS TOKEN' section for details on how to generate a correct sas token
set -e
# set -x
scriptDir="$( cd "$( dirname "$0" )" >/dev/null && pwd )"
envFile=${scriptDir}/../.env
[[ -f ${envFile} ]] && source ${envFile}
applicationInsightsCode=${APPINSIGHTS_INSTRUMENTATIONKEY}
apiBaseUrl=${API_BASE_URL:-"http://localhost:3003"}
authPingUrl=${AUTH_PING_URL:-"http://localhost:3003/ping"}
authUrl=${AUTH_URL:-"http://localhost:3003/auth"}
checkStartAPIErrorDelay=${CHECK_START_ERROR_DELAY:-"2000"}
checkStartAPIErrorMaxAttempts=${CHECK_START_MAX_ATTEMPTS:-"3"}
checkSubmissionAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"30000"}
checkSubmissionAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"10"}
connectivityCheckEnabled=${CONNECTIVITY_CHECK_ENABLED:-"false"}
connectivityCheckViewMinDisplay=${CONNECTIVITY_CHECK_MIN_DISPLAY:-"6000"}
feedbackAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"3000"}
feedbackAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
loginPendingViewMinDisplay=${LOGIN_PENDING_MIN_DISPLAY:-"750"}
production=${PRODUCTION:-"false"}
pupilPrefsAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"3000"}
pupilPrefsAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
submissionPendingViewMinDisplay=${SUBMISSION_PENDING_MIN_DISPLAY:-"6000"}
submissionUrl=${SUBMISSION_URL:-"http://localhost:3003/submit"}
submitsToCheckReceiver=${SUBMITS_TO_CHECK_RECEIVER:-"false"}
supportNumber=${SUPPORT_NUMBER:-"0300 303 3013"}
testPupilConnectionDelay=${TEST_PUPIL_CONNECTION_ERROR_DELAY:-"3000"}
testPupilConnectionMaxAttempts=${TEST_PUPIL_CONNECTION_MAX_ATTEMPTS:-"1"}
testPupilConnectionQueueName=${TEST_PUPIL_CONNECTION_QUEUE_NAME:-"test-pupil-connection"}
testPupilConnectionQueueToken=${TEST_PUPIL_CONNECTION_QUEUE_TOKEN:-"testPupilConnectionQueueTokenValue"}
testPupilConnectionQueueUrl=${TEST_PUPIL_CONNECTION_QUEUE_URL:-"testPupilConnectionQueueUrlValue"}
websiteOffline=${WEBSITE_OFFLINE:-"false"}

cat <<EOF > config.json
{
  "applicationInsightsInstrumentationKey": "$applicationInsightsCode",
  "authPingURL": "$authPingUrl",
  "authURL": "$authUrl",
  "checkStartAPIErrorDelay": $checkStartAPIErrorDelay,
  "checkStartAPIErrorMaxAttempts": $checkStartAPIErrorMaxAttempts,
  "checkSubmissionAPIErrorMaxAttempts": $checkSubmissionAPIErrorMaxAttempts,
  "checkSubmissionApiErrorDelay": $checkSubmissionAPIErrorDelay,
  "connectivityCheckEnabled": $connectivityCheckEnabled,
  "connectivityCheckViewMinDisplay": $connectivityCheckViewMinDisplay,
  "feedbackAPIErrorDelay": $feedbackAPIErrorDelay,
  "feedbackAPIErrorMaxAttempts": $feedbackAPIErrorMaxAttempts,
  "loginPendingViewMinDisplay": $loginPendingViewMinDisplay,
  "production": $production,
  "submissionPendingViewMinDisplay": $submissionPendingViewMinDisplay,
  "submissionURL": "$submissionUrl",
  "submitsToCheckReceiver": $submitsToCheckReceiver,
  "supportNumber": "$supportNumber",
  "testPupilConnectionDelay": $testPupilConnectionDelay,
  "testPupilConnectionMaxAttempts": $testPupilConnectionMaxAttempts,
  "testPupilConnectionQueueName": "$testPupilConnectionQueueName",
  "testPupilConnectionQueueToken": "$testPupilConnectionQueueToken",
  "testPupilConnectionQueueUrl": "$testPupilConnectionQueueUrl",
  "websiteOffline": $websiteOffline
}
EOF
