CREATE TABLE [mtc_results].[psychometricReport]
(PupilId              NVARCHAR(32)      NOT NULL CONSTRAINT PK_psychometricReport PRIMARY KEY,
 createdAt            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_psychometricReport_createdAt DEFAULT getutcdate(),
 updatedAt            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_psychometricReport_updatedAt DEFAULT getutcdate(),
 DOB                  DATE              NULL,
 Gender               CHAR(1)           NULL,
 Forename             NVARCHAR(128)     NULL,
 Surname              NVARCHAR(128)     NULL,
 FormMark             INT               NULL,
 QDisplayTime         DECIMAL(5,2)      NULL,
 PauseLength          DECIMAL(5,2)      NULL,
 AccessArr            NVARCHAR(128)     NULL,
 RestartReason        SMALLINT         NULL,
 RestartNumber        INT               NULL,
 ReasonNotTakingCheck INT               NULL,
 PupilStatus          NVARCHAR(32)      NULL,
 DeviceType           NVARCHAR(128)     NULL,
 DeviceTypeModel      NVARCHAR(128)     NULL,
 DeviceId             NVARCHAR(128)     NULL,
 BrowserType          NVARCHAR(128)     NULL,
 SchoolName           NVARCHAR(50)      NULL,
 Estab                SMALLINT          NULL,
 SchoolURN            INT               NULL,
 LANum                SMALLINT          NULL,
 AttemptId            UNIQUEIDENTIFIER  NULL,
 FormID               NVARCHAR(64)      NULL,
 TestDate             DATE              NULL,
 TimeStart            DATETIMEOFFSET(3) NULL,
 TimeComplete         DATETIMEOFFSET(3) NULL,
 TimeTaken            DECIMAL(9, 3)     NULL, -- SQL Server does not have a duration type; store durations as seconds with the fractional part in milliseconds
 Q1ID                 NVARCHAR(16)      NULL,
 Q1Response           INT               NULL,
 Q1InputMethods       NVARCHAR(16)      NULL,
 Q1K                  NVARCHAR(max)     NULL,
 Q1Sco                TINYINT           NULL,
 Q1ResponseTime       DECIMAL(7, 3)     NULL,
 Q1TimeOut            TINYINT           NULL,
 Q1TimeOutResponse    TINYINT           NULL,
 Q1TimeOutSco         TINYINT           NULL,
 Q1tLoad              DATETIMEOFFSET(3) NULL,
 Q1tFirstKey          DATETIMEOFFSET(3) NULL,
 Q1tLastKey           DATETIMEOFFSET(3) NULL,
 Q1OverallTime        DECIMAL(7, 3)     NULL,
 Q1RecallTime         DECIMAL(7, 3)     NULL,
 Q1ReaderStart        DATETIMEOFFSET(3) NULL,
 Q1ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q2ID                 NVARCHAR(16)      NULL,
 Q2Response           INT               NULL,
 Q2InputMethods       NVARCHAR(16)      NULL,
 Q2K                  NVARCHAR(max)     NULL,
 Q2Sco                TINYINT           NULL,
 Q2ResponseTime       DECIMAL(7, 3)     NULL,
 Q2TimeOut            TINYINT           NULL,
 Q2TimeOutResponse    TINYINT           NULL,
 Q2TimeOutSco         TINYINT           NULL,
 Q2tLoad              DATETIMEOFFSET(3) NULL,
 Q2tFirstKey          DATETIMEOFFSET(3) NULL,
 Q2tLastKey           DATETIMEOFFSET(3) NULL,
 Q2OverallTime        DECIMAL(7, 3)     NULL,
 Q2RecallTime         DECIMAL(7, 3)     NULL,
 Q2ReaderStart        DATETIMEOFFSET(3) NULL,
 Q2ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q3ID                 NVARCHAR(16)      NULL,
 Q3Response           INT               NULL,
 Q3InputMethods       NVARCHAR(16)      NULL,
 Q3K                  NVARCHAR(max)     NULL,
 Q3Sco                TINYINT           NULL,
 Q3ResponseTime       DECIMAL(7, 3)     NULL,
 Q3TimeOut            TINYINT           NULL,
 Q3TimeOutResponse    TINYINT           NULL,
 Q3TimeOutSco         TINYINT           NULL,
 Q3tLoad              DATETIMEOFFSET(3) NULL,
 Q3tFirstKey          DATETIMEOFFSET(3) NULL,
 Q3tLastKey           DATETIMEOFFSET(3) NULL,
 Q3OverallTime        DECIMAL(7, 3)     NULL,
 Q3RecallTime         DECIMAL(7, 3)     NULL,
 Q3ReaderStart        DATETIMEOFFSET(3) NULL,
 Q3ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q4ID                 NVARCHAR(16)      NULL,
 Q4Response           INT               NULL,
 Q4InputMethods       NVARCHAR(16)      NULL,
 Q4K                  NVARCHAR(max)     NULL,
 Q4Sco                TINYINT           NULL,
 Q4ResponseTime       DECIMAL(7, 3)     NULL,
 Q4TimeOut            TINYINT           NULL,
 Q4TimeOutResponse    TINYINT           NULL,
 Q4TimeOutSco         TINYINT           NULL,
 Q4tLoad              DATETIMEOFFSET(3) NULL,
 Q4tFirstKey          DATETIMEOFFSET(3) NULL,
 Q4tLastKey           DATETIMEOFFSET(3) NULL,
 Q4OverallTime        DECIMAL(7, 3)     NULL,
 Q4RecallTime         DECIMAL(7, 3)     NULL,
 Q4ReaderStart        DATETIMEOFFSET(3) NULL,
 Q4ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q5ID                 NVARCHAR(16)      NULL,
 Q5Response           INT               NULL,
 Q5InputMethods       NVARCHAR(16)      NULL,
 Q5K                  NVARCHAR(max)     NULL,
 Q5Sco                TINYINT           NULL,
 Q5ResponseTime       DECIMAL(7, 3)     NULL,
 Q5TimeOut            TINYINT           NULL,
 Q5TimeOutResponse    TINYINT           NULL,
 Q5TimeOutSco         TINYINT           NULL,
 Q5tLoad              DATETIMEOFFSET(3) NULL,
 Q5tFirstKey          DATETIMEOFFSET(3) NULL,
 Q5tLastKey           DATETIMEOFFSET(3) NULL,
 Q5OverallTime        DECIMAL(7, 3)     NULL,
 Q5RecallTime         DECIMAL(7, 3)     NULL,
 Q5ReaderStart        DATETIMEOFFSET(3) NULL,
 Q5ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q6ID                 NVARCHAR(16)      NULL,
 Q6Response           INT               NULL,
 Q6InputMethods       NVARCHAR(16)      NULL,
 Q6K                  NVARCHAR(max)     NULL,
 Q6Sco                TINYINT           NULL,
 Q6ResponseTime       DECIMAL(7, 3)     NULL,
 Q6TimeOut            TINYINT           NULL,
 Q6TimeOutResponse    TINYINT           NULL,
 Q6TimeOutSco         TINYINT           NULL,
 Q6tLoad              DATETIMEOFFSET(3) NULL,
 Q6tFirstKey          DATETIMEOFFSET(3) NULL,
 Q6tLastKey           DATETIMEOFFSET(3) NULL,
 Q6OverallTime        DECIMAL(7, 3)     NULL,
 Q6RecallTime         DECIMAL(7, 3)     NULL,
 Q6ReaderStart        DATETIMEOFFSET(3) NULL,
 Q6ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q7ID                 NVARCHAR(16)      NULL,
 Q7Response           INT               NULL,
 Q7InputMethods       NVARCHAR(16)      NULL,
 Q7K                  NVARCHAR(max)     NULL,
 Q7Sco                TINYINT           NULL,
 Q7ResponseTime       DECIMAL(7, 3)     NULL,
 Q7TimeOut            TINYINT           NULL,
 Q7TimeOutResponse    TINYINT           NULL,
 Q7TimeOutSco         TINYINT           NULL,
 Q7tLoad              DATETIMEOFFSET(3) NULL,
 Q7tFirstKey          DATETIMEOFFSET(3) NULL,
 Q7tLastKey           DATETIMEOFFSET(3) NULL,
 Q7OverallTime        DECIMAL(7, 3)     NULL,
 Q7RecallTime         DECIMAL(7, 3)     NULL,
 Q7ReaderStart        DATETIMEOFFSET(3) NULL,
 Q7ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q8ID                 NVARCHAR(16)      NULL,
 Q8Response           INT               NULL,
 Q8InputMethods       NVARCHAR(16)      NULL,
 Q8K                  NVARCHAR(max)     NULL,
 Q8Sco                TINYINT           NULL,
 Q8ResponseTime       DECIMAL(7, 3)     NULL,
 Q8TimeOut            TINYINT           NULL,
 Q8TimeOutResponse    TINYINT           NULL,
 Q8TimeOutSco         TINYINT           NULL,
 Q8tLoad              DATETIMEOFFSET(3) NULL,
 Q8tFirstKey          DATETIMEOFFSET(3) NULL,
 Q8tLastKey           DATETIMEOFFSET(3) NULL,
 Q8OverallTime        DECIMAL(7, 3)     NULL,
 Q8RecallTime         DECIMAL(7, 3)     NULL,
 Q8ReaderStart        DATETIMEOFFSET(3) NULL,
 Q8ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q9ID                 NVARCHAR(16)      NULL,
 Q9Response           INT               NULL,
 Q9InputMethods       NVARCHAR(16)      NULL,
 Q9K                  NVARCHAR(max)     NULL,
 Q9Sco                TINYINT           NULL,
 Q9ResponseTime       DECIMAL(7, 3)     NULL,
 Q9TimeOut            TINYINT           NULL,
 Q9TimeOutResponse    TINYINT           NULL,
 Q9TimeOutSco         TINYINT           NULL,
 Q9tLoad              DATETIMEOFFSET(3) NULL,
 Q9tFirstKey          DATETIMEOFFSET(3) NULL,
 Q9tLastKey           DATETIMEOFFSET(3) NULL,
 Q9OverallTime        DECIMAL(7, 3)     NULL,
 Q9RecallTime         DECIMAL(7, 3)     NULL,
 Q9ReaderStart        DATETIMEOFFSET(3) NULL,
 Q9ReaderEnd          DATETIMEOFFSET(3) NULL,
 Q10ID                NVARCHAR(16)      NULL,
 Q10Response          INT               NULL,
 Q10InputMethods      NVARCHAR(16)      NULL,
 Q10K                 NVARCHAR(max)     NULL,
 Q10Sco               TINYINT           NULL,
 Q10ResponseTime      DECIMAL(7, 3)     NULL,
 Q10TimeOut           TINYINT           NULL,
 Q10TimeOutResponse   TINYINT           NULL,
 Q10TimeOutSco        TINYINT           NULL,
 Q10tLoad             DATETIMEOFFSET(3) NULL,
 Q10tFirstKey         DATETIMEOFFSET(3) NULL,
 Q10tLastKey          DATETIMEOFFSET(3) NULL,
 Q10OverallTime       DECIMAL(7, 3)     NULL,
 Q10RecallTime        DECIMAL(7, 3)     NULL,
 Q10ReaderStart       DATETIMEOFFSET(3) NULL,
 Q10ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q11ID                NVARCHAR(16)      NULL,
 Q11Response          INT               NULL,
 Q11InputMethods      NVARCHAR(16)      NULL,
 Q11K                 NVARCHAR(max)     NULL,
 Q11Sco               TINYINT           NULL,
 Q11ResponseTime      DECIMAL(7, 3)     NULL,
 Q11TimeOut           TINYINT           NULL,
 Q11TimeOutResponse   TINYINT           NULL,
 Q11TimeOutSco        TINYINT           NULL,
 Q11tLoad             DATETIMEOFFSET(3) NULL,
 Q11tFirstKey         DATETIMEOFFSET(3) NULL,
 Q11tLastKey          DATETIMEOFFSET(3) NULL,
 Q11OverallTime       DECIMAL(7, 3)     NULL,
 Q11RecallTime        DECIMAL(7, 3)     NULL,
 Q11ReaderStart       DATETIMEOFFSET(3) NULL,
 Q11ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q12ID                NVARCHAR(16)      NULL,
 Q12Response          INT               NULL,
 Q12InputMethods      NVARCHAR(16)      NULL,
 Q12K                 NVARCHAR(max)     NULL,
 Q12Sco               TINYINT           NULL,
 Q12ResponseTime      DECIMAL(7, 3)     NULL,
 Q12TimeOut           TINYINT           NULL,
 Q12TimeOutResponse   TINYINT           NULL,
 Q12TimeOutSco        TINYINT           NULL,
 Q12tLoad             DATETIMEOFFSET(3) NULL,
 Q12tFirstKey         DATETIMEOFFSET(3) NULL,
 Q12tLastKey          DATETIMEOFFSET(3) NULL,
 Q12OverallTime       DECIMAL(7, 3)     NULL,
 Q12RecallTime        DECIMAL(7, 3)     NULL,
 Q12ReaderStart       DATETIMEOFFSET(3) NULL,
 Q12ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q13ID                NVARCHAR(16)      NULL,
 Q13Response          INT               NULL,
 Q13InputMethods      NVARCHAR(16)      NULL,
 Q13K                 NVARCHAR(max)     NULL,
 Q13Sco               TINYINT           NULL,
 Q13ResponseTime      DECIMAL(7, 3)     NULL,
 Q13TimeOut           TINYINT           NULL,
 Q13TimeOutResponse   TINYINT           NULL,
 Q13TimeOutSco        TINYINT           NULL,
 Q13tLoad             DATETIMEOFFSET(3) NULL,
 Q13tFirstKey         DATETIMEOFFSET(3) NULL,
 Q13tLastKey          DATETIMEOFFSET(3) NULL,
 Q13OverallTime       DECIMAL(7, 3)     NULL,
 Q13RecallTime        DECIMAL(7, 3)     NULL,
 Q13ReaderStart       DATETIMEOFFSET(3) NULL,
 Q13ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q14ID                NVARCHAR(16)      NULL,
 Q14Response          INT               NULL,
 Q14InputMethods      NVARCHAR(16)      NULL,
 Q14K                 NVARCHAR(max)     NULL,
 Q14Sco               TINYINT           NULL,
 Q14ResponseTime      DECIMAL(7, 3)     NULL,
 Q14TimeOut           TINYINT           NULL,
 Q14TimeOutResponse   TINYINT           NULL,
 Q14TimeOutSco        TINYINT           NULL,
 Q14tLoad             DATETIMEOFFSET(3) NULL,
 Q14tFirstKey         DATETIMEOFFSET(3) NULL,
 Q14tLastKey          DATETIMEOFFSET(3) NULL,
 Q14OverallTime       DECIMAL(7, 3)     NULL,
 Q14RecallTime        DECIMAL(7, 3)     NULL,
 Q14ReaderStart       DATETIMEOFFSET(3) NULL,
 Q14ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q15ID                NVARCHAR(16)      NULL,
 Q15Response          INT               NULL,
 Q15InputMethods      NVARCHAR(16)      NULL,
 Q15K                 NVARCHAR(max)     NULL,
 Q15Sco               TINYINT           NULL,
 Q15ResponseTime      DECIMAL(7, 3)     NULL,
 Q15TimeOut           TINYINT           NULL,
 Q15TimeOutResponse   TINYINT           NULL,
 Q15TimeOutSco        TINYINT           NULL,
 Q15tLoad             DATETIMEOFFSET(3) NULL,
 Q15tFirstKey         DATETIMEOFFSET(3) NULL,
 Q15tLastKey          DATETIMEOFFSET(3) NULL,
 Q15OverallTime       DECIMAL(7, 3)     NULL,
 Q15RecallTime        DECIMAL(7, 3)     NULL,
 Q15ReaderStart       DATETIMEOFFSET(3) NULL,
 Q15ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q16ID                NVARCHAR(16)      NULL,
 Q16Response          INT               NULL,
 Q16InputMethods      NVARCHAR(16)      NULL,
 Q16K                 NVARCHAR(max)     NULL,
 Q16Sco               TINYINT           NULL,
 Q16ResponseTime      DECIMAL(7, 3)     NULL,
 Q16TimeOut           TINYINT           NULL,
 Q16TimeOutResponse   TINYINT           NULL,
 Q16TimeOutSco        TINYINT           NULL,
 Q16tLoad             DATETIMEOFFSET(3) NULL,
 Q16tFirstKey         DATETIMEOFFSET(3) NULL,
 Q16tLastKey          DATETIMEOFFSET(3) NULL,
 Q16OverallTime       DECIMAL(7, 3)     NULL,
 Q16RecallTime        DECIMAL(7, 3)     NULL,
 Q16ReaderStart       DATETIMEOFFSET(3) NULL,
 Q16ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q17ID                NVARCHAR(16)      NULL,
 Q17Response          INT               NULL,
 Q17InputMethods      NVARCHAR(16)      NULL,
 Q17K                 NVARCHAR(max)     NULL,
 Q17Sco               TINYINT           NULL,
 Q17ResponseTime      DECIMAL(7, 3)     NULL,
 Q17TimeOut           TINYINT           NULL,
 Q17TimeOutResponse   TINYINT           NULL,
 Q17TimeOutSco        TINYINT           NULL,
 Q17tLoad             DATETIMEOFFSET(3) NULL,
 Q17tFirstKey         DATETIMEOFFSET(3) NULL,
 Q17tLastKey          DATETIMEOFFSET(3) NULL,
 Q17OverallTime       DECIMAL(7, 3)     NULL,
 Q17RecallTime        DECIMAL(7, 3)     NULL,
 Q17ReaderStart       DATETIMEOFFSET(3) NULL,
 Q17ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q18ID                NVARCHAR(16)      NULL,
 Q18Response          INT               NULL,
 Q18InputMethods      NVARCHAR(16)      NULL,
 Q18K                 NVARCHAR(max)     NULL,
 Q18Sco               TINYINT           NULL,
 Q18ResponseTime      DECIMAL(7, 3)     NULL,
 Q18TimeOut           TINYINT           NULL,
 Q18TimeOutResponse   TINYINT           NULL,
 Q18TimeOutSco        TINYINT           NULL,
 Q18tLoad             DATETIMEOFFSET(3) NULL,
 Q18tFirstKey         DATETIMEOFFSET(3) NULL,
 Q18tLastKey          DATETIMEOFFSET(3) NULL,
 Q18OverallTime       DECIMAL(7, 3)     NULL,
 Q18RecallTime        DECIMAL(7, 3)     NULL,
 Q18ReaderStart       DATETIMEOFFSET(3) NULL,
 Q18ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q19ID                NVARCHAR(16)      NULL,
 Q19Response          INT               NULL,
 Q19InputMethods      NVARCHAR(16)      NULL,
 Q19K                 NVARCHAR(max)     NULL,
 Q19Sco               TINYINT           NULL,
 Q19ResponseTime      DECIMAL(7, 3)     NULL,
 Q19TimeOut           TINYINT           NULL,
 Q19TimeOutResponse   TINYINT           NULL,
 Q19TimeOutSco        TINYINT           NULL,
 Q19tLoad             DATETIMEOFFSET(3) NULL,
 Q19tFirstKey         DATETIMEOFFSET(3) NULL,
 Q19tLastKey          DATETIMEOFFSET(3) NULL,
 Q19OverallTime       DECIMAL(7, 3)     NULL,
 Q19RecallTime        DECIMAL(7, 3)     NULL,
 Q19ReaderStart       DATETIMEOFFSET(3) NULL,
 Q19ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q20ID                NVARCHAR(16)      NULL,
 Q20Response          INT               NULL,
 Q20InputMethods      NVARCHAR(16)      NULL,
 Q20K                 NVARCHAR(max)     NULL,
 Q20Sco               TINYINT           NULL,
 Q20ResponseTime      DECIMAL(7, 3)     NULL,
 Q20TimeOut           TINYINT           NULL,
 Q20TimeOutResponse   TINYINT           NULL,
 Q20TimeOutSco        TINYINT           NULL,
 Q20tLoad             DATETIMEOFFSET(3) NULL,
 Q20tFirstKey         DATETIMEOFFSET(3) NULL,
 Q20tLastKey          DATETIMEOFFSET(3) NULL,
 Q20OverallTime       DECIMAL(7, 3)     NULL,
 Q20RecallTime        DECIMAL(7, 3)     NULL,
 Q20ReaderStart       DATETIMEOFFSET(3) NULL,
 Q20ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q21ID                NVARCHAR(16)      NULL,
 Q21Response          INT               NULL,
 Q21InputMethods      NVARCHAR(16)      NULL,
 Q21K                 NVARCHAR(max)     NULL,
 Q21Sco               TINYINT           NULL,
 Q21ResponseTime      DECIMAL(7, 3)     NULL,
 Q21TimeOut           TINYINT           NULL,
 Q21TimeOutResponse   TINYINT           NULL,
 Q21TimeOutSco        TINYINT           NULL,
 Q21tLoad             DATETIMEOFFSET(3) NULL,
 Q21tFirstKey         DATETIMEOFFSET(3) NULL,
 Q21tLastKey          DATETIMEOFFSET(3) NULL,
 Q21OverallTime       DECIMAL(7, 3)     NULL,
 Q21RecallTime        DECIMAL(7, 3)     NULL,
 Q21ReaderStart       DATETIMEOFFSET(3) NULL,
 Q21ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q22ID                NVARCHAR(16)      NULL,
 Q22Response          INT               NULL,
 Q22InputMethods      NVARCHAR(16)      NULL,
 Q22K                 NVARCHAR(max)     NULL,
 Q22Sco               TINYINT           NULL,
 Q22ResponseTime      DECIMAL(7, 3)     NULL,
 Q22TimeOut           TINYINT           NULL,
 Q22TimeOutResponse   TINYINT           NULL,
 Q22TimeOutSco        TINYINT           NULL,
 Q22tLoad             DATETIMEOFFSET(3) NULL,
 Q22tFirstKey         DATETIMEOFFSET(3) NULL,
 Q22tLastKey          DATETIMEOFFSET(3) NULL,
 Q22OverallTime       DECIMAL(7, 3)     NULL,
 Q22RecallTime        DECIMAL(7, 3)     NULL,
 Q22ReaderStart       DATETIMEOFFSET(3) NULL,
 Q22ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q23ID                NVARCHAR(16)      NULL,
 Q23Response          INT               NULL,
 Q23InputMethods      NVARCHAR(16)      NULL,
 Q23K                 NVARCHAR(max)     NULL,
 Q23Sco               TINYINT           NULL,
 Q23ResponseTime      DECIMAL(7, 3)     NULL,
 Q23TimeOut           TINYINT           NULL,
 Q23TimeOutResponse   TINYINT           NULL,
 Q23TimeOutSco        TINYINT           NULL,
 Q23tLoad             DATETIMEOFFSET(3) NULL,
 Q23tFirstKey         DATETIMEOFFSET(3) NULL,
 Q23tLastKey          DATETIMEOFFSET(3) NULL,
 Q23OverallTime       DECIMAL(7, 3)     NULL,
 Q23RecallTime        DECIMAL(7, 3)     NULL,
 Q23ReaderStart       DATETIMEOFFSET(3) NULL,
 Q23ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q24ID                NVARCHAR(16)      NULL,
 Q24Response          INT               NULL,
 Q24InputMethods      NVARCHAR(16)      NULL,
 Q24K                 NVARCHAR(max)     NULL,
 Q24Sco               TINYINT           NULL,
 Q24ResponseTime      DECIMAL(7, 3)     NULL,
 Q24TimeOut           TINYINT           NULL,
 Q24TimeOutResponse   TINYINT           NULL,
 Q24TimeOutSco        TINYINT           NULL,
 Q24tLoad             DATETIMEOFFSET(3) NULL,
 Q24tFirstKey         DATETIMEOFFSET(3) NULL,
 Q24tLastKey          DATETIMEOFFSET(3) NULL,
 Q24OverallTime       DECIMAL(7, 3)     NULL,
 Q24RecallTime        DECIMAL(7, 3)     NULL,
 Q24ReaderStart       DATETIMEOFFSET(3) NULL,
 Q24ReaderEnd         DATETIMEOFFSET(3) NULL,
 Q25ID                NVARCHAR(16)      NULL,
 Q25Response          INT               NULL,
 Q25InputMethods      NVARCHAR(16)      NULL,
 Q25K                 NVARCHAR(max)     NULL,
 Q25Sco               TINYINT           NULL,
 Q25ResponseTime      DECIMAL(7, 3)     NULL,
 Q25TimeOut           TINYINT           NULL,
 Q25TimeOutResponse   TINYINT           NULL,
 Q25TimeOutSco        TINYINT           NULL,
 Q25tLoad             DATETIMEOFFSET(3) NULL,
 Q25tFirstKey         DATETIMEOFFSET(3) NULL,
 Q25tLastKey          DATETIMEOFFSET(3) NULL,
 Q25OverallTime       DECIMAL(7, 3)     NULL,
 Q25RecallTime        DECIMAL(7, 3)     NULL,
 Q25ReaderStart       DATETIMEOFFSET(3) NULL,
 Q25ReaderEnd         DATETIMEOFFSET(3) NULL,

 CONSTRAINT IX_psychometricianReport_AttemptId_unique UNIQUE (AttemptId)
);

GO

CREATE TRIGGER [mtc_results].[psychometricReportUpdatedAtTrigger]
    ON [mtc_results].[psychometricReport]
    FOR UPDATE AS
BEGIN
    UPDATE [mtc_results].[psychometricReport]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [psychometricReport].PupilId = inserted.PupilId
END

