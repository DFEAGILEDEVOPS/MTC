CREATE TABLE adminLogonEvents
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2,
    user_id INT NOT NULL,
    sessionId NVARCHAR(MAX) NOT NULL,
    remoteIp NVARCHAR(MAX) NOT NULL,
    userAgent NVARCHAR(MAX) NOT NULL,
    loginMethod NVARCHAR(MAX) NOT NULL,
    ncaUserName NVARCHAR(MAX),
    ncaEmailAddress NVARCHAR(MAX),
    isAuthenticated BIT NOT NULL,
    body NVARCHAR(MAX),
    CONSTRAINT adminLogonEvents_user_id_fk FOREIGN KEY (user_id) REFERENCES [user] (id)
);
CREATE TABLE attendanceCode
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2,
    reason NVARCHAR(50) NOT NULL,
    [order] TINYINT NOT NULL
);
CREATE UNIQUE INDEX attendanceCode_reason_uindex ON attendanceCode (reason);
CREATE TABLE [check]
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2,
    pupil_id INT NOT NULL,
    checkCode UNIQUEIDENTIFIER DEFAULT newid() NOT NULL,
    checkWindow_id INT NOT NULL,
    checkForm_id INT NOT NULL,
    pupilLoginDate DATETIME2 NOT NULL,
    CONSTRAINT check_pupil_id_fk FOREIGN KEY (pupil_id) REFERENCES pupil (id),
    CONSTRAINT check_checkWindow_id_fk FOREIGN KEY (checkWindow_id) REFERENCES checkWindow (id),
    CONSTRAINT check_checkForm_id_fk FOREIGN KEY (checkForm_id) REFERENCES checkForm (id)
);
CREATE TABLE checkForm
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    name NVARCHAR(MAX) NOT NULL,
    isDeleted BIT DEFAULT 0 NOT NULL,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2
);
CREATE TABLE checkWindow
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    name NVARCHAR(MAX) NOT NULL,
    startDate DATETIME2 NOT NULL,
    endDate DATETIME2 NOT NULL,
    registrationStartDate DATETIME2 NOT NULL,
    registrationEndDate DATETIME2 NOT NULL,
    isDeleted BIT DEFAULT 0 NOT NULL
);
CREATE TABLE dbMigrationLog
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    fileName NVARCHAR(MAX) NOT NULL,
    appliedAt DATETIME2 DEFAULT getdate() NOT NULL
);
CREATE TABLE hdf
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    signedDate DATETIME2 DEFAULT getdate() NOT NULL,
    declaration NVARCHAR(MAX) NOT NULL,
    jobTitle NVARCHAR(MAX) NOT NULL,
    fullName NVARCHAR(MAX) NOT NULL,
    school_id INT NOT NULL,
    CONSTRAINT hdf_school_id_fk FOREIGN KEY (school_id) REFERENCES school (id)
);
CREATE TABLE pupil
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2 DEFAULT getdate(),
    school_id INT NOT NULL,
    foreName NVARCHAR(MAX) NOT NULL,
    middleNames NVARCHAR(MAX),
    lastName NVARCHAR(MAX) NOT NULL,
    gender CHAR(1) NOT NULL,
    dateOfBirth DATETIME2 NOT NULL,
    pinExpiresAt DATETIME2,
    upn CHAR(13) NOT NULL,
    pin CHAR(5),
    speechSynthesis BIT DEFAULT 0 NOT NULL
);
CREATE UNIQUE INDEX pupil_upn_uindex ON pupil (upn);
CREATE UNIQUE INDEX pupil_pin_uindex ON pupil (pin);
CREATE TABLE pupilAttendance
(
    pupil_id INT PRIMARY KEY NOT NULL,
    recordedByUser_id INT NOT NULL,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    attendanceCode_id INT NOT NULL,
    updatedAt DATETIME2,
    CONSTRAINT pupilAttendance_attendanceCode_id_fk FOREIGN KEY (pupil_id) REFERENCES attendanceCode (id),
    CONSTRAINT pupilAttendance_pupil_id_fk FOREIGN KEY (pupil_id) REFERENCES pupil (id)
);
CREATE UNIQUE INDEX pupilAttendance_pupil_id_uindex ON pupilAttendance (pupil_id);
CREATE TABLE question
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    factor1 TINYINT NOT NULL,
    factor2 TINYINT NOT NULL,
    [order] TINYINT NOT NULL,
    checkForm_id INT,
    CONSTRAINT question_checkForm_id_fk FOREIGN KEY (checkForm_id) REFERENCES checkForm (id)
);
CREATE TABLE role
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    role NVARCHAR(MAX) NOT NULL
);
CREATE TABLE school
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2,
    leaCode INT,
    estabCode NVARCHAR(MAX),
    name NVARCHAR(MAX) NOT NULL,
    pin NVARCHAR(MAX),
    pinExpiresAt DATETIME2
);
CREATE TABLE [user]
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    createdAt DATETIME2 DEFAULT getdate() NOT NULL,
    updatedAt DATETIME2,
    externalId NVARCHAR(MAX) NOT NULL,
    passwordHash NVARCHAR(MAX),
    school_id INT NOT NULL,
    role_id INT NOT NULL,
    CONSTRAINT user_role_id_fk FOREIGN KEY (role_id) REFERENCES role (id)
);