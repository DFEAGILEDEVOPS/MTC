CREATE TABLE mtc_admin.ncaToolsSession
(
    id INT PRIMARY KEY NOT NULL IDENTITY,
    sessionToken NVARCHAR(1024) NOT NULL,
    userName NVARCHAR(MAX) NOT NULL,
    userType NVARCHAR(50),
    emailAddress NVARCHAR(MAX),
    dfeSchoolNumber INT
)
CREATE UNIQUE INDEX ncaToolsSession_sessionToken_uindex ON mtc_admin.ncaToolsSession (sessionToken)