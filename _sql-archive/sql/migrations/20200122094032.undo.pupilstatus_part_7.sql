-- Load the lookup table content
INSERT INTO [mtc_admin].[pupilStatus] (description, code) VALUES ('The pupil has not been allocated a check', 'UNALLOC');
INSERT INTO [mtc_admin].[pupilStatus] (description, code) VALUES ('The pupil has been allocated a check', 'ALLOC');
INSERT INTO [mtc_admin].[pupilStatus] (description, code) VALUES ('The pupil has logged in and collected the check', 'LOGGED_IN');
INSERT INTO [mtc_admin].[pupilStatus] (description, code) VALUES ('The pupil clicked the "Start Now" button and started taking the real, live check', 'STARTED');
INSERT INTO [mtc_admin].[pupilStatus] (description, code) VALUES ('The pupil has completed the live check', 'COMPLETED');
INSERT INTO [mtc_admin].[pupilStatus] (description, code) VALUES ('The pupil has been marked as not taking the check for some reason', 'NOT_TAKING');