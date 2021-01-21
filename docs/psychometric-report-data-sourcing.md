# Data sourcing for the Psychometric Report



## Pupil information

| Psychometric field   | Source                      | Comment |
| -------------------- | --------------------------- | ------- |
| DOB                  | mtc_admin.pupil.dateOfBirth |         |
| Gender               | mtc_admin.pupil.gender      |         |
| PupilID              | mtc_admin.pupil.upn         |         |
| Forename             | mtc_admin.pupil.foreName    |         |
| Surname              | mtc_admin.pupil.lastName    |         |
| ReasonNotTakingCheck | mtc_admin.pupilAttendance   |         |



## School information

| Psychometric field | Source                     | Comment |
| ------------------ | -------------------------- | ------- |
| SchoolName         | mtc_admin.school.name      |         |
| Estab              | mtc_admin.school.estabCode |         |
| SchoolURN          | mtc_admin.school.urn       |         |
| LAnum              | mtc_admin.school.laCode    |         |



##  Check settings

| Psychometric field | Source                        | Comment |
| ------------------ | ----------------------------- | ------- |
| QDisplayTime       | mtc_admin.checkConfig.payload | JSON    |
| PauseLength        | mtc_admin.checkConfig.payload | JSON    |
| AccessArr          | mtc_admin.checkConfig.payload | JSON    |



## Check information

| Psychometric field | Source                                     | Comment                                                      |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| AttemptID          | mtc_admin.check.checkCode                  | GUID                                                         |
| FormID             | mtc_admin.checkForm.name                   |                                                              |
| TestDate           | mtc_admin.check.pupilLoginDate             |                                                              |
| TimeStart          | mtc_results.event                          | Where eventType = "CheckStarted"                             |
| TimeComplete       | mtc_results.userInput OR mtc_results.event | Time the check was completed - From last key (enter) is pressed or timeout.  userInput is user is the user pressed 'Enter' but the event is used if we need to use the timeout.  This is the same as the timestamp on the answer. |
| TimeTaken          | Calculated                                 | TimeComplete - TimeStart expressed as a duration in hh::mm::ss |
| RestartNumber      | mtc_admin.pupilRestart                     | Values 0-2                                                   |
| FormMark           | mtc_results.checkResult.mark               | As pupils could have taken many checks the check used by the report is determined by the the check ID stored in mtc_admin.pupil.currentCheckId which is a FK to mtc_admin.check |



## Device information

| Psychometric field | Source                          | Comment                                       |
| ------------------ | ------------------------------- | --------------------------------------------- |
| DeviceType         | **mtc_results.userDevice.TODO** |                                               |
| BrowserType        | mtc_results.userDevice.browser* | 4 fields to get browser family and version    |
| DeviceTypeModel    | **mtc_results.userDevice.TODO** |                                               |
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
| QnResponseTime     | mtc_results.userInput       | QntLastkey - QntFirstKey                                     |
| QnTimeOut          | mtc_results.userInput       | If the user pressed the Enter key as the last input it did not timeout |
| QnTimeOutResponse  | QnTimeout, QnResponse       | Timeout with no response (1 = with response, 0 = no response, empty = didn't time out) |
| QnTimeOutSco       | QnTimeout and QnScore       | Timeout with correct answer (1 = correct, 0 = incorrect, empty = didn't time out) |
| QntLoad            | mtc_results.event           | Timestamp when the question loads.  Where eventType = QuestionTimerStarted |
| QntFirstKey        | mtc_results.userInput       | Timestamp of the first key pressed (whether using key, mouse or touchscreen) |
| QntLastKey         | mtc_results.userInput       | Timestamp of the last key that is not "enter" (whether using key, mouse or touchscreen) QntLastKey excludes everything that is not 0-9 |
| QnOverallTime      | QntLastKey, QntLoad         | QntLastKey - QntLoad                                         |
| QnRecallTime       | QntFirstKey, QntLoad        | Time between question appearing and the first key being pressed [QntFirstKey - QntLoad] (whether using key, mouse or touchscreen) |
| QnReaderStart      | mtc_results.event           | Where eventType = QuestionReadingStarted                     |
| QnReaderEnd        | mtc_results.event           | Where eventType = QuestionReadingEnded                       |