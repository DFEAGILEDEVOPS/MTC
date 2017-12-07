INSERT INTO [admin].settings (id, loadingTimeLimit, questionTimeLimit) VALUES (1, 5, 2);

INSERT INTO [admin].attendanceCode (reason, [order], code) VALUES ('Absent', 1, 'ABSNT');
INSERT INTO [admin].attendanceCode (reason, [order], code) VALUES ('Left', 2, 'LEFTT');
INSERT INTO [admin].attendanceCode (reason, [order], code) VALUES ('Incorrect Registration', 3, 'INCRG');
INSERT INTO [admin].attendanceCode (reason, [order], code) VALUES ('Withdrawn', 4, 'WTDRN');

INSERT INTO [admin].[role] (title) VALUES ('SERVICE-MANAGER');
INSERT INTO [admin].[role] (title) VALUES ('TEST-DEVELOPER');
INSERT INTO [admin].[role] (title) VALUES ('TEACHER');
