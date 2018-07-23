#!/bin/bash
apiUrl=${API_URL:-"http://localhost:3001"}
authUrl=${AUTH_URL:-"http://localhost:3001/api/questions"}
checkStartedUrl=${CHECK_STARTED_URL:-"http://localhost:3001/api/check-started"}
checkSubmissionUrl=${CHECK_SUBMISSION_URL:-"http://localhost:3001/api/completed-check"}
production=${PRODUCTION:-"false"}
checkStartAPIErrorDelay=${CHECK_START_ERROR_DELAY:-"2000"}
checkStartAPIErrorMaxAttempts=${CHECK_START_MAX_ATTEMPTS:-"3"}
checkSubmissionAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"30000"}
checkSubmissionAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"10"}
submissionPendingViewMinDisplay=${SUBMISSION_PENDING_MIN_DISPLAY:-"6000"}
supportNumber=${SUPPORT_NUMBER:-"0345 278 8080"}
gaCode=${GA_CODE:-"null"}
if [ $gaCode == "null" ]
then
    gaCodeParsed="null"
else
    gaCodeParsed="\"$gaCode\""
fi
applicationInsightsCode=${APP_INSIGHTS_CODE:-"null"}
if [ $applicationInsightsCode == "null" ]
then
    applicationInsightsCodeParsed="null"
else
    applicationInsightsCodeParsed="\"$applicationInsightsCode\""
fi

cat <<EOF > config.json
{
  "apiURL": "$apiUrl",
  "authURL": "$authUrl",
  "checkStartedURL": "$checkStartedUrl",
  "checkSubmissionURL": "$checkSubmissionUrl",
  "production": $production,
  "checkStartAPIErrorDelay": $checkStartAPIErrorDelay,
  "checkStartAPIErrorMaxAttempts": $checkStartAPIErrorMaxAttempts,
  "checkSubmissionApiErrorDelay": $checkSubmissionAPIErrorDelay,
  "checkSubmissionAPIErrorMaxAttempts": $checkSubmissionAPIErrorMaxAttempts,
  "submissionPendingViewMinDisplay": $submissionPendingViewMinDisplay,
  "supportNumber": "$supportNumber",
  "googleAnalyticsTrackingCode": $gaCodeParsed,
  "applicationInsightsInstrumentationKey": $applicationInsightsCodeParsed
}
EOF
