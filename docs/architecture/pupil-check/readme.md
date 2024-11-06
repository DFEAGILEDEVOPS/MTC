# Pupil Check

- [Back to Architecture Home](../readme.md)

## Overview

The Pupil Check is a browser based Angular application written in Typescript that is used by pupils to complete the Multiplication Tables Check.  The application is designed to be accessible to all pupils, including those with special educational needs and disabilities.  The application is designed to be used on a variety of devices, including desktops, laptops and tablets.

An example payload can be found [here](../data/check-payload.json)

## Pupil Events

The Pupil Check application emits a number of events that are captured by the MTC service.  These events are used to monitor the progress of the pupil through the check, and to identify any issues that may arise.  The events are captured by the MTC service and stored in the database for later analysis.

| Event Name | Description |
| --------- | ---------------- |
| AppError | Application error in the pupil's browser |
| AppHidden | This event is triggered when the pupil-app changes from being in the foreground to the background, e.g. when switching to another tab/window in the browser, or to another application. |
| AppVisible | This event is triggered when the pupil-app changes from being in the background to the foreground. Opposite of the AppHidden event. |
| CheckStarted | This event is triggered when the pupil clicks the "Start" button after completing the initial practice questions. |
| CheckStartedAPICallFailed | An API call to MTC failed. |
| CheckStartedAPICallSucceeded | An API call to MTC succeeded. |
| CheckStartedApiCalled | An API call to MTC has been sent. |
| CheckSubmissionAPICallSucceeded | An API call to MTC succeeded.  This API returns the pupil results to MTC. |
| CheckSubmissionAPIFailed | An API to return the pupil results to MTC failed. |
| CheckSubmissionApiCalled | An API to return the pupil results to MTC has been called. |
| CheckSubmissionFailed | The browser was unable to return the payload to MTC, even after several attempts. No more attempts will be made. |
| CheckSubmissionPending | The browser has sent the data to MTC and is waiting for a response. |
| PauseRendered | The Pause screen was displayed in the browser. This allows the pupils to rest for a few seconds before the next question. |
| PupilPrefsAPICallFailed | An API call failed to update the pupil preferences - e.g. font size and/or colour scheme. |
| PupilPrefsAPICallSucceeded | An API call succeeded, this updates the pupil preferences - e.g. font size and/or colour scheme. |
| PupilPrefsAPICalled | An API call from the pupil-app to MTC to update pupil preferences has been sent and is awaiting a response. |
| QuestionAnswered | The user has pressed "Enter" to complete the question with time on the clock remaining. |
| QuestionIntroRendered | This event is triggered when the Questions Intro page is displayed in the browser.  This page is the one that says "There will be 25 questions". |
| QuestionReadingEnded | The browser speech API stopped speaking the question. |
| QuestionReadingStarted | The browser speech API started speaking the question. |
| QuestionTimerCancelled | The user cancelled the current question timer, by pressing "Enter" with an answer. |
| QuestionTimerEnded | The question timer ran out of time. |
| QuestionTimerStarted | The question timer started. |
| RefreshDetected | The application was reloaded, e.g. by the user clicking refresh in the browser. |
| RefreshOrTabCloseDetected | The browser window may have been refreshed, or closed.  This event is attached to window:beforeunload in the browser. |
| SessionExpired | The session expired. |
| UtteranceEnded | The browser finished speaking a short phrase. |
| UtteranceStarted | The browser started speaking a short phrase. |
| WarmupCompleteRendered | The warmup complete page was displayed in the browser. |
| WarmupIntroRendered | The warmup introduction page was displayed in the browser. |
| WarmupStarted | The event is triggered by the user clicking the "Start Now" button on the instructions page. |
| QuestionRendered | The question screen was shown. For spoken questions this event is registered when the screen is showm, but the question itself is not shown until after the speech has finished. |
