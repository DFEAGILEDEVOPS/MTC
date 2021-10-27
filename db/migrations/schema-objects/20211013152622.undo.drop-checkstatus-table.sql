CREATE TABLE [mtc_admin].[checkStatus]
(id          INT IDENTITY
     CONSTRAINT PK_checkStatus PRIMARY KEY,
 createdAt   DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 updatedAt   DATETIMEOFFSET(3) DEFAULT getutcdate() NOT NULL,
 version     TIMESTAMP                              NOT NULL,
 description NVARCHAR(50)                           NOT NULL,
 code        CHAR(3)                                NOT NULL
     CONSTRAINT checkStatus_code_uindex unIque
);
