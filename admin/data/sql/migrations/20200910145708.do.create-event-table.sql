DROP TABLE IF EXISTS mtc_results.eventTypeLookup;

CREATE TABLE mtc_results.eventTypeLookup
(id               INT IDENTITY (1,1) NOT NULL,
 createdAt        DATETIMEOFFSET(3)  NOT NULL DEFAULT GETUTCDATE(),
 updatedAt        DATETIMEOFFSET(3)  NOT NULL DEFAULT GETUTCDATE(),
 version          ROWVERSION,
 eventType        NVARCHAR(255)      NOT NULL,
 eventDescription NVARCHAR(4000),
 CONSTRAINT PK_eventTypeLookup PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT eventTypeLookup_eventType_uindex UNIQUE (eventType)
);


INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription)
VALUES ('AppError', 'Application error in the pupil''s browser'),
       ('AppHidden', 'This event is triggered when the pupil-app changes from being in the foreground to the background, e.g. when switching to another tab/window in the browser, or to another application.'),
       ('AppVisible', 'This event is triggered when the pupil-app changes from being in the background to the foreground. Opposite of the AppHidden event.'),
       ('CheckStarted', 'This event is triggered when the pupil clicks the "Start" button after completing the initial practise questions.'),
       ('CheckStartedAPICallFailed', 'An API call to MTC failed.'),
       ('CheckStartedAPICallSucceeded', 'An API call to MTC succeeded.'),
       ('CheckStartedApiCalled', 'An API call to MTC has been sent.'),
       ('CheckSubmissionAPICallSucceeded', 'An API call to MTC succeeded.  This API returns the pupil results to MTC.'),
       ('CheckSubmissionAPIFailed', 'An API to return the pupil results to MTC failed.'),
       ('CheckSubmissionApiCalled', 'An API to return the pupil results to MTC has been called.'),
       ('CheckSubmissionFailed', 'The browser was unable to return the payload to MTC, even after several attempts. No more attempts will be made.'),
       ('CheckSubmissionPending', 'The browser has sent the data to MTC and is waiting for a response.'),
       ('PauseRendered', 'The Pause screen which allows the pupils to rest for a few seconds before a question was displayed in the browser.'),
       ('PupilPrefsAPICallFailed', 'An API call failed to update the pupil preferences - e.g. font size and/or colour scheme.'),
       ('PupilPrefsAPICallSucceeded', 'AN API call succeeded, this updates the pupil preferences - e.g. font size and/or colour scheme.'),
       ('PupilPrefsAPICalled', 'An API call from the pupil-app to MTC to update pupil preferences has been sent and is awaiting a response.'),
       ('QuestionAnswered', 'The user has pressed "Enter" to complete the question with time on the clock remaining.'),
       ('QuestionIntroRendered', 'This event is triggered when the Questions Intro page is displayed in the browser.  This page is the one that says "There will be 25 questions".'),
       ('QuestionReadingEnded', 'The browser speech API stopped speaking the question.'),
       ('QuestionReadingStarted', 'The browser speech API started speaking the question.'),
       ('QuestionTimerCancelled', 'The user cancelled the current question timer, by pressing "Enter" with an answer.'),
       ('QuestionTimerEnded', 'The question timer ran out of time.'),
       ('QuestionTimerStarted', 'The question timer started.'),
       ('RefreshDetected', 'The application was reloaded, e.g. by the user clicking refresh in the browser.'),
       ('RefreshOrTabCloseDetected', 'The browser window may have been refreshed, or closed.  This event is attached to window:beforeunload in the browser.'),
       ('SessionExpired', 'The session expired.'),
       ('UtteranceEnded', 'The browser finished speaking a short phrase.'),
       ('UtteranceStarted', 'The browser started speaking a short phrase.'),
       ('WarmupCompleteRendered', 'The warmup complete page was displayed in the browser.'),
       ('WarmupIntroRendered', 'The warmup introduction page was displayed in the browser.'),
       ('WarmupStarted', 'The event is triggered by the user clicking the "Start Now" button on the instructions page.');


DROP TABLE IF EXISTS mtc_results.event;

CREATE TABLE mtc_results.event
(id                 INT IDENTITY (1,1) NOT NULL,
 createdAt          DATETIMEOFFSET(3)  NOT NULL DEFAULT GETUTCDATE(),
 updatedAt          DATETIMEOFFSET(3)  NOT NULL DEFAULT GETUTCDATE(),
 version            ROWVERSION,
 checkResult_id     INT                NOT NULL,
 eventTypeLookup_id INT                NOT NULL,
 browserTimestamp   DATETIMEOFFSET(3)  NOT NULL, -- client timestamp from the browser/javascript
 eventData          NVARCHAR(max),
 CONSTRAINT PK_event PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT FK_event_checkResult_id FOREIGN KEY (checkResult_id) REFERENCES mtc_results.checkResult (id),
 CONSTRAINT FK_event_eventTypeLookup_id FOREIGN KEY (eventTypeLookup_id) REFERENCES mtc_results.eventTypeLookup,
);

CREATE INDEX ix_event_eventTypeLookup_id ON mtc_results.event (eventTypeLookup_id);
CREATE INDEX ix_event_checkResult_id ON mtc_results.event (checkResult_id);



