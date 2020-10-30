INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Absent during check window', 2, 'ABSNT');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Left school', 3, 'LEFTT');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Incorrect registration', 1, 'INCRG');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Unable to access', 4, 'NOACC');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Working below expectation', 5, 'BLSTD');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Just arrived and unable to establish abilities', 6, 'JSTAR');


INSERT INTO mtc_admin.azureBlobFileType (code, [description]) VALUES ('PSR', 'Psychometrician Report');


INSERT INTO mtc_admin.checkStatus ([description], code) VALUES ('New', 'NEW');
INSERT INTO mtc_admin.checkStatus ([description], code) VALUES ('Complete', 'CMP');
INSERT INTO mtc_admin.checkStatus ([description], code) VALUES ('Collected', 'COL');
INSERT INTO mtc_admin.checkStatus ([description], code) VALUES ('Not Received', 'NTR');
INSERT INTO mtc_admin.checkStatus ([description], code) VALUES ('Check voided or annulled', 'VOD');
INSERT INTO mtc_admin.checkStatus ([description], code) VALUES ('Error in processing submitted check', 'ERR');


INSERT INTO mtc_admin.jobStatus ([description], jobStatusCode) VALUES ('Submitted', 'SUB');
INSERT INTO mtc_admin.jobStatus ([description], jobStatusCode) VALUES ('Processing', 'PRC');
INSERT INTO mtc_admin.jobStatus ([description], jobStatusCode) VALUES ('Completed', 'COM');
INSERT INTO mtc_admin.jobStatus ([description], jobStatusCode) VALUES ('Completed with errors', 'CWR');
INSERT INTO mtc_admin.jobStatus ([description], jobStatusCode) VALUES ('Failed', 'FLD');
INSERT INTO mtc_admin.jobStatus ([description], jobStatusCode) VALUES ('Removed', 'DEL');


INSERT INTO mtc_admin.jobType ([description], jobTypeCode) VALUES ('Pupil Census', 'CEN');
INSERT INTO mtc_admin.jobType ([description], jobTypeCode) VALUES ('Psychometrician Report', 'PSY');


-- populate the pin table with all 4 digit pins that don't use 0 or 1
DROP TABLE IF EXISTS #pinStaging;
CREATE TABLE #pinStaging (pin INT);
GO

DECLARE @i int;
SET @i = 2222; -- start at 2222 as 0's and 1's aren't allowed

WHILE (@i < 10000)
BEGIN
  INSERT INTO #pinStaging (pin) VALUES (@i);
  SET @i = @i + 1;
END

-- 0 and 1 are not allowed in the pin
DELETE FROM #pinStaging where pin LIKE '%0%' or pin LIKE '%1%';

-- the staging step is only so we can insert the pins randomly
INSERT INTO [mtc_admin].[pin] ([val])
SELECT TOP 4096 pin from #pinStaging
ORDER BY NEWID();

DROP TABLE #pinStaging;


INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, [description], code) VALUES (1, 'Black on White', 'BOW');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, [description], code) VALUES (2, 'Yellow on Black', 'YOB');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, [description], code) VALUES (3, 'Black on Blue', 'BOB');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, [description], code) VALUES (4, 'Black on Peach', 'BOP');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, [description], code) VALUES (5, 'Blue on Cream', 'BOC');


INSERT INTO mtc_admin.pupilFontSizes (displayOrder, [description], code) VALUES (1, 'Very small', 'VSM');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, [description], code) VALUES (2, 'Small', 'SML');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, [description], code) VALUES (3, 'Regular', 'RGL');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, [description], code) VALUES (4, 'Large', 'LRG');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, [description], code) VALUES (5, 'Very large', 'XLG');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, [description], code) VALUES (6, 'Largest', 'XXL');


INSERT INTO mtc_admin.pupilRestartCode ([description], code) VALUES ('Remove restart', 'REM');
INSERT INTO mtc_admin.pupilRestartCode ([description], code) VALUES ('Restart taken', 'TKN');
INSERT INTO mtc_admin.pupilRestartCode ([description], code) VALUES ('Maximum number of restarts taken', 'MAX');


INSERT INTO mtc_admin.pupilRestartReason (displayOrder, [description], code) VALUES (1, 'Loss of internet', 'LOI');
INSERT INTO mtc_admin.pupilRestartReason (displayOrder, [description], code) VALUES (2, 'IT issues', 'ITI');
INSERT INTO mtc_admin.pupilRestartReason (displayOrder, [description], code) VALUES (3, 'Classroom disruption', 'CLD');
INSERT INTO mtc_admin.pupilRestartReason (displayOrder, [description], code) VALUES (4, 'Did not complete', 'DNC');


INSERT INTO [mtc_admin].[question] (factor1, factor2, code, isWarmup)
VALUES (1, 1, 'W001', 1),
       (1, 2, 'W002', 1),
       (1, 3, 'W003', 1),
       (1, 4, 'W004', 1),
       (1, 5, 'W005', 1),
       (1, 6, 'W006', 1),
       (1, 7, 'W007', 1),
       (1, 8, 'W008', 1),
       (1, 9, 'W009', 1),
       (1, 10, 'W010', 1),
       (1, 11, 'W011', 1),
       (1, 12, 'W012', 1),
       (2, 1, 'W013', 1),
       (2, 2, 'W014', 1),
       (2, 3, 'W015', 1),
       (2, 4, 'W016', 1),
       (2, 5, 'W017', 1),
       (2, 6, 'W018', 1),
       (2, 7, 'W019', 1),
       (2, 8, 'W020', 1),
       (2, 9, 'W021', 1),
       (2, 10, 'W022', 1),
       (2, 11, 'W023', 1),
       (2, 12, 'W024', 1),
       (3, 1, 'W025', 1),
       (3, 2, 'W026', 1),
       (3, 3, 'W027', 1),
       (3, 4, 'W028', 1),
       (3, 5, 'W029', 1),
       (3, 6, 'W030', 1),
       (3, 7, 'W031', 1),
       (3, 8, 'W032', 1),
       (3, 9, 'W033', 1),
       (3, 10, 'W034', 1),
       (3, 11, 'W035', 1),
       (3, 12, 'W036', 1),
       (4, 1, 'W037', 1),
       (4, 2, 'W038', 1),
       (4, 3, 'W039', 1),
       (4, 4, 'W040', 1),
       (4, 5, 'W041', 1),
       (4, 6, 'W042', 1),
       (4, 7, 'W043', 1),
       (4, 8, 'W044', 1),
       (4, 9, 'W045', 1),
       (4, 10, 'W046', 1),
       (4, 11, 'W047', 1),
       (4, 12, 'W048', 1),
       (5, 1, 'W049', 1),
       (5, 2, 'W050', 1),
       (5, 3, 'W051', 1),
       (5, 4, 'W052', 1),
       (5, 5, 'W053', 1),
       (5, 6, 'W054', 1),
       (5, 7, 'W055', 1),
       (5, 8, 'W056', 1),
       (5, 9, 'W057', 1),
       (5, 10, 'W058', 1),
       (5, 11, 'W059', 1),
       (5, 12, 'W060', 1),
       (6, 1, 'W061', 1),
       (6, 2, 'W062', 1),
       (6, 3, 'W063', 1),
       (6, 4, 'W064', 1),
       (6, 5, 'W065', 1),
       (6, 6, 'W066', 1),
       (6, 7, 'W067', 1),
       (6, 8, 'W068', 1),
       (6, 9, 'W069', 1),
       (6, 10, 'W070', 1),
       (6, 11, 'W071', 1),
       (6, 12, 'W072', 1),
       (7, 1, 'W073', 1),
       (7, 2, 'W074', 1),
       (7, 3, 'W075', 1),
       (7, 4, 'W076', 1),
       (7, 5, 'W077', 1),
       (7, 6, 'W078', 1),
       (7, 7, 'W079', 1),
       (7, 8, 'W080', 1),
       (7, 9, 'W081', 1),
       (7, 10, 'W082', 1),
       (7, 11, 'W083', 1),
       (7, 12, 'W084', 1),
       (8, 1, 'W085', 1),
       (8, 2, 'W086', 1),
       (8, 3, 'W087', 1),
       (8, 4, 'W088', 1),
       (8, 5, 'W089', 1),
       (8, 6, 'W090', 1),
       (8, 7, 'W091', 1),
       (8, 8, 'W092', 1),
       (8, 9, 'W093', 1),
       (8, 10, 'W094', 1),
       (8, 11, 'W095', 1),
       (8, 12, 'W096', 1),
       (9, 1, 'W097', 1),
       (9, 2, 'W098', 1),
       (9, 3, 'W099', 1),
       (9, 4, 'W100', 1),
       (9, 5, 'W101', 1),
       (9, 6, 'W102', 1),
       (9, 7, 'W103', 1),
       (9, 8, 'W104', 1),
       (9, 9, 'W105', 1),
       (9, 10, 'W106', 1),
       (9, 11, 'W107', 1),
       (9, 12, 'W108', 1),
       (10, 1, 'W109', 1),
       (10, 2, 'W110', 1),
       (10, 3, 'W111', 1),
       (10, 4, 'W112', 1),
       (10, 5, 'W113', 1),
       (10, 6, 'W114', 1),
       (10, 7, 'W115', 1),
       (10, 8, 'W116', 1),
       (10, 9, 'W117', 1),
       (10, 10, 'W118', 1),
       (10, 11, 'W119', 1),
       (10, 12, 'W120', 1),
       (11, 1, 'W121', 1),
       (11, 2, 'W122', 1),
       (11, 3, 'W123', 1),
       (11, 4, 'W124', 1),
       (11, 5, 'W125', 1),
       (11, 6, 'W126', 1),
       (11, 7, 'W127', 1),
       (11, 8, 'W128', 1),
       (11, 9, 'W129', 1),
       (11, 10, 'W130', 1),
       (11, 11, 'W131', 1),
       (11, 12, 'W132', 1),
       (12, 1, 'W133', 1),
       (12, 2, 'W134', 1),
       (12, 3, 'W135', 1),
       (12, 4, 'W136', 1),
       (12, 5, 'W137', 1),
       (12, 6, 'W138', 1),
       (12, 7, 'W139', 1),
       (12, 8, 'W140', 1),
       (12, 9, 'W141', 1),
       (12, 10, 'W142', 1),
       (12, 11, 'W143', 1),
       (12, 12, 'W144', 1),
       (1, 1, 'Q001', 0),
       (1, 2, 'Q002', 0),
       (1, 3, 'Q003', 0),
       (1, 4, 'Q004', 0),
       (1, 5, 'Q005', 0),
       (1, 6, 'Q006', 0),
       (1, 7, 'Q007', 0),
       (1, 8, 'Q008', 0),
       (1, 9, 'Q009', 0),
       (1, 10, 'Q010', 0),
       (1, 11, 'Q011', 0),
       (1, 12, 'Q012', 0),
       (2, 1, 'Q013', 0),
       (2, 2, 'Q014', 0),
       (2, 3, 'Q015', 0),
       (2, 4, 'Q016', 0),
       (2, 5, 'Q017', 0),
       (2, 6, 'Q018', 0),
       (2, 7, 'Q019', 0),
       (2, 8, 'Q020', 0),
       (2, 9, 'Q021', 0),
       (2, 10, 'Q022', 0),
       (2, 11, 'Q023', 0),
       (2, 12, 'Q024', 0),
       (3, 1, 'Q025', 0),
       (3, 2, 'Q026', 0),
       (3, 3, 'Q027', 0),
       (3, 4, 'Q028', 0),
       (3, 5, 'Q029', 0),
       (3, 6, 'Q030', 0),
       (3, 7, 'Q031', 0),
       (3, 8, 'Q032', 0),
       (3, 9, 'Q033', 0),
       (3, 10, 'Q034', 0),
       (3, 11, 'Q035', 0),
       (3, 12, 'Q036', 0),
       (4, 1, 'Q037', 0),
       (4, 2, 'Q038', 0),
       (4, 3, 'Q039', 0),
       (4, 4, 'Q040', 0),
       (4, 5, 'Q041', 0),
       (4, 6, 'Q042', 0),
       (4, 7, 'Q043', 0),
       (4, 8, 'Q044', 0),
       (4, 9, 'Q045', 0),
       (4, 10, 'Q046', 0),
       (4, 11, 'Q047', 0),
       (4, 12, 'Q048', 0),
       (5, 1, 'Q049', 0),
       (5, 2, 'Q050', 0),
       (5, 3, 'Q051', 0),
       (5, 4, 'Q052', 0),
       (5, 5, 'Q053', 0),
       (5, 6, 'Q054', 0),
       (5, 7, 'Q055', 0),
       (5, 8, 'Q056', 0),
       (5, 9, 'Q057', 0),
       (5, 10, 'Q058', 0),
       (5, 11, 'Q059', 0),
       (5, 12, 'Q060', 0),
       (6, 1, 'Q061', 0),
       (6, 2, 'Q062', 0),
       (6, 3, 'Q063', 0),
       (6, 4, 'Q064', 0),
       (6, 5, 'Q065', 0),
       (6, 6, 'Q066', 0),
       (6, 7, 'Q067', 0),
       (6, 8, 'Q068', 0),
       (6, 9, 'Q069', 0),
       (6, 10, 'Q070', 0),
       (6, 11, 'Q071', 0),
       (6, 12, 'Q072', 0),
       (7, 1, 'Q073', 0),
       (7, 2, 'Q074', 0),
       (7, 3, 'Q075', 0),
       (7, 4, 'Q076', 0),
       (7, 5, 'Q077', 0),
       (7, 6, 'Q078', 0),
       (7, 7, 'Q079', 0),
       (7, 8, 'Q080', 0),
       (7, 9, 'Q081', 0),
       (7, 10, 'Q082', 0),
       (7, 11, 'Q083', 0),
       (7, 12, 'Q084', 0),
       (8, 1, 'Q085', 0),
       (8, 2, 'Q086', 0),
       (8, 3, 'Q087', 0),
       (8, 4, 'Q088', 0),
       (8, 5, 'Q089', 0),
       (8, 6, 'Q090', 0),
       (8, 7, 'Q091', 0),
       (8, 8, 'Q092', 0),
       (8, 9, 'Q093', 0),
       (8, 10, 'Q094', 0),
       (8, 11, 'Q095', 0),
       (8, 12, 'Q096', 0),
       (9, 1, 'Q097', 0),
       (9, 2, 'Q098', 0),
       (9, 3, 'Q099', 0),
       (9, 4, 'Q100', 0),
       (9, 5, 'Q101', 0),
       (9, 6, 'Q102', 0),
       (9, 7, 'Q103', 0),
       (9, 8, 'Q104', 0),
       (9, 9, 'Q105', 0),
       (9, 10, 'Q106', 0),
       (9, 11, 'Q107', 0),
       (9, 12, 'Q108', 0),
       (10, 1, 'Q109', 0),
       (10, 2, 'Q110', 0),
       (10, 3, 'Q111', 0),
       (10, 4, 'Q112', 0),
       (10, 5, 'Q113', 0),
       (10, 6, 'Q114', 0),
       (10, 7, 'Q115', 0),
       (10, 8, 'Q116', 0),
       (10, 9, 'Q117', 0),
       (10, 10, 'Q118', 0),
       (10, 11, 'Q119', 0),
       (10, 12, 'Q120', 0),
       (11, 1, 'Q121', 0),
       (11, 2, 'Q122', 0),
       (11, 3, 'Q123', 0),
       (11, 4, 'Q124', 0),
       (11, 5, 'Q125', 0),
       (11, 6, 'Q126', 0),
       (11, 7, 'Q127', 0),
       (11, 8, 'Q128', 0),
       (11, 9, 'Q129', 0),
       (11, 10, 'Q130', 0),
       (11, 11, 'Q131', 0),
       (11, 12, 'Q132', 0),
       (12, 1, 'Q133', 0),
       (12, 2, 'Q134', 0),
       (12, 3, 'Q135', 0),
       (12, 4, 'Q136', 0),
       (12, 5, 'Q137', 0),
       (12, 6, 'Q138', 0),
       (12, 7, 'Q139', 0),
       (12, 8, 'Q140', 0),
       (12, 9, 'Q141', 0),
       (12, 10, 'Q142', 0),
       (12, 11, 'Q143', 0),
       (12, 12, 'Q144', 0);


INSERT INTO mtc_admin.questionReaderReasons (displayOrder, [description], code) VALUES (1, 'English as an additional language (EAL)', 'EAL');
INSERT INTO mtc_admin.questionReaderReasons (displayOrder, [description], code) VALUES (2, 'Slow processing', 'SLP');
INSERT INTO mtc_admin.questionReaderReasons (displayOrder, [description], code) VALUES (3, 'Visual impairments', 'VIM');
INSERT INTO mtc_admin.questionReaderReasons (displayOrder, [description], code) VALUES (4, 'Other', 'OTH');


INSERT INTO mtc_admin.role (title) VALUES ('SERVICE-MANAGER');
INSERT INTO mtc_admin.role (title) VALUES ('TEST-DEVELOPER');
INSERT INTO mtc_admin.role (title) VALUES ('TEACHER');
INSERT INTO mtc_admin.role (title) VALUES ('HELPDESK');
INSERT INTO mtc_admin.role (title) VALUES ('TECH-SUPPORT');


INSERT INTO mtc_admin.settings (id, loadingTimeLimit, questionTimeLimit, checkTimeLimit) VALUES (1, 3.00, 6.00, 30);


INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('AppError', 'Application error in the pupil''s browser');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('AppHidden', 'This event is triggered when the pupil-app changes from being in the foreground to the background, e.g. when switching to another tab/window in the browser, or to another application.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('AppVisible', 'This event is triggered when the pupil-app changes from being in the background to the foreground. Opposite of the AppHidden event.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckStarted', 'This event is triggered when the pupil clicks the "Start" button after completing the initial practice questions.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckStartedAPICallFailed', 'An API call to MTC failed.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckStartedAPICallSucceeded', 'An API call to MTC succeeded.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckStartedApiCalled', 'An API call to MTC has been sent.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckSubmissionAPICallSucceeded', 'An API call to MTC succeeded.  This API returns the pupil results to MTC.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckSubmissionAPIFailed', 'An API to return the pupil results to MTC failed.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckSubmissionApiCalled', 'An API to return the pupil results to MTC has been called.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckSubmissionFailed', 'The browser was unable to return the payload to MTC, even after several attempts. No more attempts will be made.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('CheckSubmissionPending', 'The browser has sent the data to MTC and is waiting for a response.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('PauseRendered', 'The Pause screen was displayed in the browser. This allows the pupils to rest for a few seconds before the next question.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('PupilPrefsAPICallFailed', 'An API call failed to update the pupil preferences - e.g. font size and/or colour scheme.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('PupilPrefsAPICallSucceeded', 'AN API call succeeded, this updates the pupil preferences - e.g. font size and/or colour scheme.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('PupilPrefsAPICalled', 'An API call from the pupil-app to MTC to update pupil preferences has been sent and is awaiting a response.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionAnswered', 'The user has pressed "Enter" to complete the question with time on the clock remaining.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionIntroRendered', 'This event is triggered when the Questions Intro page is displayed in the browser.  This page is the one that says "There will be 25 questions".');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionReadingEnded', 'The browser speech API stopped speaking the question.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionReadingStarted', 'The browser speech API started speaking the question.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionTimerCancelled', 'The user cancelled the current question timer, by pressing "Enter" with an answer.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionTimerEnded', 'The question timer ran out of time.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionTimerStarted', 'The question timer started.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('RefreshDetected', 'The application was reloaded, e.g. by the user clicking refresh in the browser.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('RefreshOrTabCloseDetected', 'The browser window may have been refreshed, or closed.  This event is attached to window:beforeunload in the browser.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('SessionExpired', 'The session expired.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('UtteranceEnded', 'The browser finished speaking a short phrase.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('UtteranceStarted', 'The browser started speaking a short phrase.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('WarmupCompleteRendered', 'The warmup complete page was displayed in the browser.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('WarmupIntroRendered', 'The warmup introduction page was displayed in the browser.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('WarmupStarted', 'The event is triggered by the user clicking the "Start Now" button on the instructions page.');
INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription) VALUES ('QuestionRendered', 'The question screen was shown. For spoken questions this event is registered when the screen is showm, but the question itself is not shown until after the speech has finished.');


INSERT INTO mtc_results.userInputTypeLookup ([name], code) VALUES ('Mouse', 'M');
INSERT INTO mtc_results.userInputTypeLookup ([name], code) VALUES ('Keyboard', 'K');
INSERT INTO mtc_results.userInputTypeLookup ([name], code) VALUES ('Touch', 'T');
INSERT INTO mtc_results.userInputTypeLookup ([name], code) VALUES ('Unknown', 'X');
