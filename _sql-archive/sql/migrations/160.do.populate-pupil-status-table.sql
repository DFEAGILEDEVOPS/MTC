insert into [mtc_admin].[pupilStatus] (code, description)
values
       ('UNALLOC', 'The pupil has not been allocated a check'),
       ('ALLOC', 'The pupil has been allocated a check'),
       ('LOGGED_IN', 'The pupil has logged in and collected the check'),
       ('STARTED', 'The pupil clicked the "Start Now" button and started taking the real, live check'),
       ('COMPLETED', 'The pupil has completed the live check'),
       ('NOT_TAKING', 'The pupil has been marked as not taking the check for some reason');
