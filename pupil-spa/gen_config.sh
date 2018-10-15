#!/bin/bash
featureUseHpa=${FEATURE_USE_HPA:-"false"}
if [[ "$featureUseHpa" == "true" ]]; then
    authUrl=${AUTH_URL:-"http://localhost:3003/auth"}
else
    authUrl=${AUTH_URL:-"http://localhost:3001/api/questions"}
    apiUrl=${API_URL:-"http://localhost:3001"}
    checkStartedUrl=${CHECK_STARTED_URL:-"http://localhost:3001/api/check-started"}
    checkSubmissionUrl=${CHECK_SUBMISSION_URL:-"http://localhost:3001/api/completed-check"}
fi
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
buttonHideDelay=${BUTTON_HIDE_DELAY:-"1000"}
supportNumber=${SUPPORT_NUMBER:-"0345 278 8080"}
gaCode=${GA_CODE:-"null"}
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
  "featureUseHpa": $featureUseHpa,
  "apiURL": "$apiUrl",
  "authURL": "$authUrl",
  "checkStartedURL": "$checkStartedUrl",
  "checkSubmissionURL": "$checkSubmissionUrl",
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
  "buttonHideDelay": $buttonHideDelay
}
EOF
