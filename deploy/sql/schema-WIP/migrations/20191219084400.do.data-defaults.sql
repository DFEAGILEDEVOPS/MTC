INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (1, 'Audible time alert', 'ATA');
INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (2, 'Colour contrast', 'CCT');
INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (3, 'Font size', 'FTS');
INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (4, 'Input assistance (reason required)', 'ITA');
INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (5, '''Next'' button between questions (reason required)', 'NBQ');
INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (6, 'Question reader (reason required)', 'QNR');
INSERT INTO mtc_admin.accessArrangements (displayOrder, description, code) VALUES (7, 'Remove on-screen number pad', 'RON');

INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Absent', 2, 'ABSNT');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Left school', 3, 'LEFTT');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Incorrect registration', 1, 'INCRG');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Unable to access', 4, 'NOACC');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Working below expectation', 5, 'BLSTD');
INSERT INTO mtc_admin.attendanceCode (reason, [order], code) VALUES ('Just arrived with EAL', 6, 'JSTAR');

INSERT INTO mtc_admin.azureBlobFileType (code, description) VALUES ('PSR', 'Psychometrician Report');

INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('New', 'NEW');
INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('Expired', 'EXP');
INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('Complete', 'CMP');
INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('Started', 'STD');
INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('Collected', 'COL');
INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('Not Received', 'NTR');
INSERT INTO mtc_admin.checkStatus (description, code) VALUES ('Check voided or annulled', 'VOD');

INSERT INTO mtc_admin.jobStatus (description, jobStatusCode) VALUES ('Submitted', 'SUB');
INSERT INTO mtc_admin.jobStatus (description, jobStatusCode) VALUES ('Processing', 'PRC');
INSERT INTO mtc_admin.jobStatus (description, jobStatusCode) VALUES ('Completed', 'COM');
INSERT INTO mtc_admin.jobStatus (description, jobStatusCode) VALUES ('Completed with errors', 'CWR');
INSERT INTO mtc_admin.jobStatus (description, jobStatusCode) VALUES ('Failed', 'FLD');
INSERT INTO mtc_admin.jobStatus (description, jobStatusCode) VALUES ('Removed', 'DEL');

INSERT INTO mtc_admin.jobType (description, jobTypeCode) VALUES ('Pupil Census', 'CEN');
INSERT INTO mtc_admin.jobType (description, jobTypeCode) VALUES ('Psychometrician Report', 'PSY');

INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, description, code) VALUES (1, 'Black on White', 'BOW');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, description, code) VALUES (2, 'Yellow on Black', 'YOB');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, description, code) VALUES (3, 'Black on Blue', 'BOB');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, description, code) VALUES (4, 'Black on Peach', 'BOP');
INSERT INTO mtc_admin.pupilColourContrasts (displayOrder, description, code) VALUES (5, 'Blue on Cream', 'BOC');

INSERT INTO mtc_admin.pupilFontSizes (displayOrder, description, code) VALUES (1, 'Very small', 'VSM');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, description, code) VALUES (2, 'Small', 'SML');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, description, code) VALUES (3, 'Regular', 'RGL');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, description, code) VALUES (4, 'Large', 'LRG');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, description, code) VALUES (5, 'Very large', 'XLG');
INSERT INTO mtc_admin.pupilFontSizes (displayOrder, description, code) VALUES (6, 'Largest', 'XXL');

INSERT INTO mtc_admin.pupilRestartCode (description, code) VALUES ('Remove restart', 'REM');
INSERT INTO mtc_admin.pupilRestartCode (description, code) VALUES ('Restart taken', 'TKN');
INSERT INTO mtc_admin.pupilRestartCode (description, code) VALUES ('Maximum number of restarts taken', 'MAX');

INSERT INTO mtc_admin.pupilRestartReason (displayOrder, description, code) VALUES (1, 'Loss of internet', 'LOI');
INSERT INTO mtc_admin.pupilRestartReason (displayOrder, description, code) VALUES (2, 'IT issues', 'ITI');
INSERT INTO mtc_admin.pupilRestartReason (displayOrder, description, code) VALUES (3, 'Classroom disruption', 'CLD');
INSERT INTO mtc_admin.pupilRestartReason (displayOrder, description, code) VALUES (4, 'Did not complete', 'DNC');

INSERT INTO mtc_admin.pupilStatus (description, code) VALUES ('The pupil has not been allocated a check', 'UNALLOC');
INSERT INTO mtc_admin.pupilStatus (description, code) VALUES ('The pupil has been allocated a check', 'ALLOC');
INSERT INTO mtc_admin.pupilStatus (description, code) VALUES ('The pupil has logged in and collected the check', 'LOGGED_IN');
INSERT INTO mtc_admin.pupilStatus (description, code) VALUES ('The pupil clicked the "Start Now" button and started taking the real, live check', 'STARTED');
INSERT INTO mtc_admin.pupilStatus (description, code) VALUES ('The pupil has completed the live check', 'COMPLETED');
INSERT INTO mtc_admin.pupilStatus (description, code) VALUES ('The pupil has been marked as not taking the check for some reason', 'NOT_TAKING');

INSERT INTO mtc_admin.questionReaderReasons (displayOrder, description, code) VALUES (1, 'English as an additional language (EAL)', 'EAL');
INSERT INTO mtc_admin.questionReaderReasons (displayOrder, description, code) VALUES (2, 'Slow processing', 'SLP');
INSERT INTO mtc_admin.questionReaderReasons (displayOrder, description, code) VALUES (3, 'Visual impairments', 'VIM');
INSERT INTO mtc_admin.questionReaderReasons (displayOrder, description, code) VALUES (4, 'Other', 'OTH');

INSERT INTO mtc_admin.role (title) VALUES ('SERVICE-MANAGER');
INSERT INTO mtc_admin.role (title) VALUES ('TEST-DEVELOPER');
INSERT INTO mtc_admin.role (title) VALUES ('TEACHER');
INSERT INTO mtc_admin.role (title) VALUES ('HELPDESK');

INSERT INTO mtc_admin.settings (id, loadingTimeLimit, questionTimeLimit, checkTimeLimit) VALUES (1, 2.00, 6.00, 10);
