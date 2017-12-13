INSERT INTO [mtc].settings (id, loadingTimeLimit, questionTimeLimit) VALUES (1, 5, 2);

INSERT INTO [mtc].attendanceCode (reason, [order], code) VALUES ('Absent', 1, 'ABSNT');
INSERT INTO [mtc].attendanceCode (reason, [order], code) VALUES ('Left', 2, 'LEFTT');
INSERT INTO [mtc].attendanceCode (reason, [order], code) VALUES ('Incorrect Registration', 3, 'INCRG');
INSERT INTO [mtc].attendanceCode (reason, [order], code) VALUES ('Withdrawn', 4, 'WTDRN');

INSERT INTO [mtc].[role] (title) VALUES ('SERVICE-MANAGER');
INSERT INTO [mtc].[role] (title) VALUES ('TEST-DEVELOPER');
INSERT INTO [mtc].[role] (title) VALUES ('TEACHER');
