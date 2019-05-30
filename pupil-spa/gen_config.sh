#!/bin/bash
authUrl=${AUTH_URL:-"http://localhost:3003/auth"}
production=${PRODUCTION:-"false"}
checkStartAPIErrorDelay=${CHECK_START_ERROR_DELAY:-"2000"}
checkStartAPIErrorMaxAttempts=${CHECK_START_MAX_ATTEMPTS:-"3"}
checkSubmissionAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"30000"}
checkSubmissionAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"10"}
feedbackAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"3000"}
feedbackAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
pupilPrefsAPIErrorDelay=${CHECK_SUBMISSION_ERROR_DELAY:-"3000"}
pupilPrefsAPIErrorMaxAttempts=${CHECK_SUBMISSION_MAX_ATTEMPTS:-"3"}
submissionPendingViewMinDisplay=${SUBMISSION_PENDING_MIN_DISPLAY:-"6000"}
supportNumber=${SUPPORT_NUMBER:-"0300 303 3013"}
gaCode=${GA_CODE:-"null"}
websiteOffline=${WEBSITE_OFFLINE:-"false"}
if [ $gaCode == "null" ]
then
    gaCodeParsed="null"
else
    gaCodeParsed="\"$gaCode\""
fi
applicationInsightsCode=${APPINSIGHTS_INSTRUMENTATIONKEY:-"null"}
if [ $applicationInsightsCode == "null" ]
then
    applicationInsightsCodeParsed="null"
else
    applicationInsightsCodeParsed="\"$applicationInsightsCode\""
fi

cat <<EOF > config.json
{
  "authURL": "$authUrl",
  "production": $production,
  "checkStartAPIErrorDelay": $checkStartAPIErrorDelay,
  "checkStartAPIErrorMaxAttempts": $checkStartAPIErrorMaxAttempts,
  "checkSubmissionApiErrorDelay": $checkSubmissionAPIErrorDelay,
  "checkSubmissionAPIErrorMaxAttempts": $checkSubmissionAPIErrorMaxAttempts,
  "feedbackAPIErrorDelay": $feedbackAPIErrorDelay,
  "feedbackAPIErrorMaxAttempts": $feedbackAPIErrorMaxAttempts,
  "submissionPendingViewMinDisplay": $submissionPendingViewMinDisplay,
  "supportNumber": "$supportNumber",
  "googleAnalyticsTrackingCode": $gaCodeParsed,
  "applicationInsightsInstrumentationKey": $applicationInsightsCodeParsed,
  "websiteOffline": $websiteOffline
}
EOF
