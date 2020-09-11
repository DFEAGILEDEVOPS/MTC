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
VALUES ('AppError', ''),
       ('AppHidden', ''),
       ('AppVisible', ''),
       ('CheckStarted', ''),
       ('CheckStartedAPICallFailed', ''),
       ('CheckStartedAPICallSucceeded', ''),
       ('CheckStartedApiCalled', ''),
       ('CheckSubmissionAPICallSucceeded', ''),
       ('CheckSubmissionAPIFailed', ''),
       ('CheckSubmissionApiCalled', ''),
       ('CheckSubmissionFailed', ''),
       ('CheckSubmissionPending', ''),
       ('PauseRendered', ''),
       ('PupilPrefsAPICallFailed', ''),
       ('PupilPrefsAPICallSucceeded', ''),
       ('PupilPrefsAPICalled', ''),
       ('QuestionAnswered', ''),
       ('QuestionIntroRendered', ''),
       ('QuestionReadingEnded', ''),
       ('QuestionReadingStarted', ''),
       ('QuestionTimerCancelled', ''),
       ('QuestionTimerEnded', ''),
       ('QuestionTimerStarted', ''),
       ('RefreshDetected', ''),
       ('RefreshOrTabCloseDetected', ''),
       ('SessionExpired', ''),
       ('UtteranceEnded', ''),
       ('UtteranceStarted', ''),
       ('WarmupCompleteRendered', ''),
       ('WarmupIntroRendered', ''),
       ('WarmupStarted',
        'The WarmupStarted event is triggered by the user clicking the "Start Now" button on the instructions page.');


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



