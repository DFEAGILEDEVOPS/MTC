# Data sourcing for the Psychometric Report



## Pupil information

| Psychometric field   | Source                                              | Comment                                                      |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| PupilId              | mtc_admin.pupil.id                                  | Unique synthetic id for the psychometric report and pupil tables       |
| DOB                  | mtc_admin.pupil.dateOfBirth                         |                                                              |
| Gender               | mtc_admin.pupil.gender                              |                                                              |
| PupilUPN              | mtc_admin.pupil.upn                                 |                                                              |
| Forename             | mtc_admin.pupil.foreName                            |                                                              |
| Surname              | mtc_admin.pupil.lastName                            |                                                              |
| ReasonNotTakingCheck | mtc_admin.pupilAttendance                           | **Blank** - no reason not taking the check, **Z** - Incorrect registration,  **A** - Absent,  **L** - Left school,   **U** - Unable to access,  **B** - Working below the overall standard of the check,  **J** - Just arrived |
| PupilStatus          | mtc_admin.pupil.complete, mtc_admin.pupilAttendance | calculated                                                   |
| ImportedFromCensus | mtc_admin.pupil.job_id | True is a job_id is present, false otherwise.  True means the puil record was imported from census data (e.g. by the Service Manager).  Note it may be edited later by the school. |



## School information

| Psychometric field | Source                     | Comment |
| ------------------ | -------------------------- | ------- |
| SchoolName         | mtc_admin.school.name      |         |
| Estab              | mtc_admin.school.estabCode |         |
| SchoolURN          | mtc_admin.school.urn       |         |
| LAnum              | mtc_admin.school.laCode    |         |
| ToECode            | mtc_admin.typeOfEstablishmentLookup.code | Type Of Establishment Code |



##  Check settings

| Psychometric field | Source                        | Comment                                                      |
| ------------------ | ----------------------------- | ------------------------------------------------------------ |
| QDisplayTime       | mtc_admin.checkConfig.payload | JSON                                                         |
| PauseLength        | mtc_admin.checkConfig.payload | JSON                                                         |
| AccessArr          | mtc_admin.checkConfig.payload | Source is JSON<br />**1** - Audible time alert,  **2** - In-built screen reader,  **3** - Colour contrast, **4** - Input assistance,  **5** - Font size, **6** - Next button, **7** - Remove number pad |



## Check information

| Psychometric field | Source                                               | Comment                                                      |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| AttemptID          | mtc_admin.check.checkCode                            | GUID                                                         |
| FormID             | mtc_admin.checkForm.name                             |                                                              |
| TestDate           | mtc_admin.check.pupilLoginDate                       |                                                              |
| TimeStart          | mtc_results.event                                    | Where eventType = "CheckStarted"                             |
| TimeComplete       | mtc_results.userInput OR mtc_results.event           | Time the check was completed - From last key (enter) is pressed or timeout.  userInput is user is the user pressed 'Enter' but the event is used if we need to use the timeout.  This is the same as the timestamp on the answer. |
| TimeTaken          | Calculated                                           | TimeComplete - TimeStart                                     |
| RestartNumber      | mtc_admin.pupilRestart                               | Values 0-2                                                   |
| RestartReason      | mtc_admin.pupilRestart, mtc_admin.restartReasonLookUp | **Blank** - no restart, **1** - Loss of internet,  **2** - Local IT issues,  **3** - Classroom disruption,  **4** - Pupil did not complete. |
| FormMark           | mtc_results.checkResult.mark                         | As pupils could have taken many checks the check used by the report is determined by the the check ID stored in mtc_admin.pupil.currentCheckId which is a FK to mtc_admin.check |



## Device information

| Psychometric field | Source                          | Comment                                       |
| ------------------ | ------------------------------- | --------------------------------------------- |
| BrowserType        | mtc_results.userDevice.browser* | 4 fields to get browser family and version    |
| DeviceID           | mtc_results.userDevice.ident    | Determined by a cookie on the pupil's browser |



## Question information

where *n* is the question number (from 1 to 25)

| Psychometric field | Source                      | Comment                                                      |
| ------------------ | --------------------------- | ------------------------------------------------------------ |
| QnID               | mtc_admin.question          | e.g. '6x7'                                                   |
| QnResponse         | mtc_results.answer          | the answer provided by the pupil                             |
| QnInputMethods     | mtc_results.userInputLookup | Single character string: `k` - when using keyboard `t` - when using a touchscreen `m` - when using a mouse `x` - when combination blank - when there is no input |
| QnK                | mtc_results.userInput       | Lists each individual key stroke during the time limit separated by square brackets and preceded by: `k` - when using keyboard `t` - when using a touchscreen `m` - when using a mouse `x` - when combination blank - when there is no input |
| QnSco              | mtc_results.answer          | Question answer (1 = correct, 0 = incorrect)                 |
| QntFirstKey        | mtc_results.userInput       | Timestamp of the first key pressed (whether using key, mouse or touchscreen) |
| QntLastKey         | mtc_results.userInput       | Timestamp of the last key that is not "enter" (whether using key, mouse or touchscreen) QntLastKey excludes everything that is not 0-9 |
| QnResponseTime     | mtc_results.userInput       | QntLastkey - QntFirstKey                                     |
| QnTimeOut          | mtc_results.userInput       | If the user pressed the Enter key as the last input it did not timeout |
| QnTimeOutResponse  | QnTimeout, QnResponse       | Timeout with no response (1 = with response, 0 = no response, empty = didn't time out) |
| QnTimeOutSco       | QnTimeout and QnScore       | Timeout with correct answer (1 = correct, 0 = incorrect, empty = didn't time out) |
| QntLoad            | mtc_results.event           | Timestamp when the question loads.  Where eventType = QuestionTimerStarted |
| QnOverallTime      | QntLastKey, QntLoad         | QntLastKey - QntLoad                                         |
| QnRecallTime       | QntFirstKey, QntLoad        | Time between question appearing and the first key being pressed [QntFirstKey - QntLoad] (whether using key, mouse or touchscreen) |
| QnReaderStart      | mtc_results.event           | Where eventType = QuestionReadingStarted                     |
| QnReaderEnd        | mtc_results.event           | Where eventType = QuestionReadingEnded                       |
