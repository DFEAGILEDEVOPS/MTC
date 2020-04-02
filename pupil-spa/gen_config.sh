#!/bin/bash

# support root .env file for local development scenarios...
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
if [ -f ${scriptDir}/../.env ]
then
  # enables all following variable definitions to be exported...
  set -o allexport
  source ../.env
  # disable it again
  set +o allexport
fi

authUrl=${AUTH_URL:-"http://localhost:3003/auth"}
authPingUrl=${AUTH_PING_URL:-"http://localhost:3003/ping"}
production=${PRODUCTION:-"false"}
checkStartAPIErrorDelay=${CHECK_START_ERROR_DELAY:-"2000"}
checkStartAPIErrorMaxAttempts=${CHECK_START_MAX_ATTEMPTS:-"3"}
checkSubmissionAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"30000"}
checkSubmissionAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
feedbackAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"3000"}
feedbackAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
pupilPrefsAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"3000"}
pupilPrefsAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
submissionPendingViewMinDisplay=${SUBMISSION_PENDING_MIN_DISPLAY:-"6000"}
loginPendingViewMinDisplay=${LOGIN_PENDING_MIN_DISPLAY:-"750"}
testPupilConnectionQueueName=${TEST_PUPIL_CONNECTION_QUEUE_NAME:-"test-pupil-connection"}
testPupilConnectionQueueUrl=${TEST_PUPIL_CONNECTION_QUEUE_URL:-"testPupilConnectionQueueUrlValue"}
testPupilConnectionQueueToken=${TEST_PUPIL_CONNECTION_QUEUE_TOKEN:-"testPupilConnectionQueueTokenValue"}
supportNumber=${SUPPORT_NUMBER:-"0300 303 3013"}
gaCode=${GA_CODE:-"null"}
websiteOffline=${WEBSITE_OFFLINE:-"false"}
submitsToCheckReceiver=${SUBMITS_TO_CHECK_RECEIVER:-"false"}
testPupilConnectionViewMinDisplayMs=${TEST_PUPIL_CONNECTION_MIN_DISPLAY_MS:-"6000"}
testPupilConnectionRetryDelayMs=${TEST_PUPIL_CONNECTION_RETRY_WAIT_MS:-"3000"}
testPupilConnectionMaxRetries=${TEST_PUPIL_CONNECTION_MAX_RETRIES:-"1"}
testPupilConnectionEnabled=${TEST_PUPIL_CONNECTION_ENABLED:-"false"}


if [[ gaCode == "null" ]]
then
    gaCodeParsed="null"
else
    gaCodeParsed="\"$gaCode\""
fi
applicationInsightsCode=${APPINSIGHTS_INSTRUMENTATIONKEY:-"null"}
if [[ applicationInsightsCode == "null" ]]
then
    applicationInsightsCodeParsed="null"
else
    applicationInsightsCodeParsed="\"$applicationInsightsCode\""
fi

cat <<EOF > config.json
{
  "applicationInsightsInstrumentationKey": $applicationInsightsCodeParsed,
  "authURL": "$authUrl",
  "authPingURL": "$authPingUrl",
  "checkStartAPIErrorDelay": $checkStartAPIErrorDelay,
  "checkStartAPIErrorMaxAttempts": $checkStartAPIErrorMaxAttempts,
  "checkSubmissionApiErrorDelay": $checkSubmissionAPIErrorDelay,
  "checkSubmissionAPIErrorMaxAttempts": $checkSubmissionAPIErrorMaxAttempts,
  "feedbackAPIErrorDelay": $feedbackAPIErrorDelay,
  "feedbackAPIErrorMaxAttempts": $feedbackAPIErrorMaxAttempts,
  "googleAnalyticsTrackingCode": $gaCodeParsed,
  "loginPendingViewMinDisplay": $loginPendingViewMinDisplay,
  "production": $production,
  "submissionPendingViewMinDisplay": $submissionPendingViewMinDisplay,
  "submitsToCheckReceiver": $submitsToCheckReceiver,
  "supportNumber": "$supportNumber",
  "testpupilConnectionEnabled": $testPupilConnectionEnabled,
  "testPupilConnectionMaxRetries": $testPupilConnectionMaxRetries,
  "testPupilConnectionQueueName": "$testPupilConnectionQueueName",
  "testPupilConnectionQueueUrl": "$testPupilConnectionQueueUrl",
  "testPupilConnectionQueueToken": "$testPupilConnectionQueueToken",
  "testPupilConnectionRetryDelayMs": $testPupilConnectionRetryDelayMs,
  "testPupilConnectionViewMinDisplayMs": $testPupilConnectionViewMinDisplayMs,
  "websiteOffline": $websiteOffline
}
EOF
