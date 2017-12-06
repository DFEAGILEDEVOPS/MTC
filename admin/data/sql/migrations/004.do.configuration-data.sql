INSERT INTO dbo.settings (id, loadingTimeLimit, questionTimeLimit) VALUES (1, 5, 2);

INSERT INTO dbo.attendanceCode (reason, [order], code) VALUES ('Absent', 1, 'ABSNT');
INSERT INTO dbo.attendanceCode (reason, [order], code) VALUES ('Left', 2, 'LEFTT');
INSERT INTO dbo.attendanceCode (reason, [order], code) VALUES ('Incorrect Registration', 3, 'INCRG');
INSERT INTO dbo.attendanceCode (reason, [order], code) VALUES ('Withdrawn', 4, 'WTDRN');

INSERT INTO dbo.role (role) VALUES ('SERVICE-MANAGER');
INSERT INTO dbo.role (role) VALUES ('TEST-DEVELOPER');
INSERT INTO dbo.role (role) VALUES ('TEACHER');
