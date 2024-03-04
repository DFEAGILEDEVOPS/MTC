IF NOT EXISTS(
  SELECT *
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'psychometricReport_2023'
    AND TABLE_SCHEMA = 'mtc_results'
)
BEGIN
    CREATE TABLE mtc_results.psychometricReport
    (
        PupilId int NOT NULL,
        PupilUPN nvarchar(32) NOT NULL,
        createdAt datetimeoffset(7) NOT NULL DEFAULT (getutcdate()),
        updatedAt datetimeoffset(7) NOT NULL DEFAULT (getutcdate()),
        DOB date NULL,
        Gender char(1) NULL,
        Forename nvarchar(128) NULL,
        Surname nvarchar(128) NULL,
        FormMark int NULL,
        QDisplayTime decimal(5, 2) NULL,
        PauseLength decimal(5, 2) NULL,
        AccessArr nvarchar(128) NULL,
        RestartReason smallint NULL,
        RestartNumber int NULL,
        PupilStatus nvarchar(32) NULL,
        DeviceId nvarchar(128) NULL,
        BrowserType nvarchar(128) NULL,
        SchoolName nvarchar(max) NULL,
        Estab smallint NULL,
        SchoolURN int NULL,
        LANum smallint NULL,
        AttemptId uniqueidentifier NULL,
        FormID nvarchar(64) NULL,
        TestDate date NULL,
        TimeStart datetimeoffset(7) NULL,
        TimeComplete datetimeoffset(7) NULL,
        TimeTaken decimal(9, 3) NULL,
        Q1ID nvarchar(16) NULL,
        Q1Response nvarchar(60) NULL,
        Q1InputMethods nvarchar(16) NULL,
        Q1K nvarchar(max) NULL,
        Q1Sco tinyint NULL,
        Q1ResponseTime decimal(7, 3) NULL,
        Q1TimeOut tinyint NULL,
        Q1TimeOutResponse tinyint NULL,
        Q1TimeOutSco tinyint NULL,
        Q1tLoad datetimeoffset(7) NULL,
        Q1tFirstKey datetimeoffset(7) NULL,
        Q1tLastKey datetimeoffset(7) NULL,
        Q1OverallTime decimal(7, 3) NULL,
        Q1RecallTime decimal(7, 3) NULL,
        Q1ReaderStart datetimeoffset(7) NULL,
        Q1ReaderEnd datetimeoffset(7) NULL,
        Q2ID nvarchar(16) NULL,
        Q2Response nvarchar(60) NULL,
        Q2InputMethods nvarchar(16) NULL,
        Q2K nvarchar(max) NULL,
        Q2Sco tinyint NULL,
        Q2ResponseTime decimal(7, 3) NULL,
        Q2TimeOut tinyint NULL,
        Q2TimeOutResponse tinyint NULL,
        Q2TimeOutSco tinyint NULL,
        Q2tLoad datetimeoffset(7) NULL,
        Q2tFirstKey datetimeoffset(7) NULL,
        Q2tLastKey datetimeoffset(7) NULL,
        Q2OverallTime decimal(7, 3) NULL,
        Q2RecallTime decimal(7, 3) NULL,
        Q2ReaderStart datetimeoffset(7) NULL,
        Q2ReaderEnd datetimeoffset(7) NULL,
        Q3ID nvarchar(16) NULL,
        Q3Response nvarchar(60) NULL,
        Q3InputMethods nvarchar(16) NULL,
        Q3K nvarchar(max) NULL,
        Q3Sco tinyint NULL,
        Q3ResponseTime decimal(7, 3) NULL,
        Q3TimeOut tinyint NULL,
        Q3TimeOutResponse tinyint NULL,
        Q3TimeOutSco tinyint NULL,
        Q3tLoad datetimeoffset(7) NULL,
        Q3tFirstKey datetimeoffset(7) NULL,
        Q3tLastKey datetimeoffset(7) NULL,
        Q3OverallTime decimal(7, 3) NULL,
        Q3RecallTime decimal(7, 3) NULL,
        Q3ReaderStart datetimeoffset(7) NULL,
        Q3ReaderEnd datetimeoffset(7) NULL,
        Q4ID nvarchar(16) NULL,
        Q4Response nvarchar(60) NULL,
        Q4InputMethods nvarchar(16) NULL,
        Q4K nvarchar(max) NULL,
        Q4Sco tinyint NULL,
        Q4ResponseTime decimal(7, 3) NULL,
        Q4TimeOut tinyint NULL,
        Q4TimeOutResponse tinyint NULL,
        Q4TimeOutSco tinyint NULL,
        Q4tLoad datetimeoffset(7) NULL,
        Q4tFirstKey datetimeoffset(7) NULL,
        Q4tLastKey datetimeoffset(7) NULL,
        Q4OverallTime decimal(7, 3) NULL,
        Q4RecallTime decimal(7, 3) NULL,
        Q4ReaderStart datetimeoffset(7) NULL,
        Q4ReaderEnd datetimeoffset(7) NULL,
        Q5ID nvarchar(16) NULL,
        Q5Response nvarchar(60) NULL,
        Q5InputMethods nvarchar(16) NULL,
        Q5K nvarchar(max) NULL,
        Q5Sco tinyint NULL,
        Q5ResponseTime decimal(7, 3) NULL,
        Q5TimeOut tinyint NULL,
        Q5TimeOutResponse tinyint NULL,
        Q5TimeOutSco tinyint NULL,
        Q5tLoad datetimeoffset(7) NULL,
        Q5tFirstKey datetimeoffset(7) NULL,
        Q5tLastKey datetimeoffset(7) NULL,
        Q5OverallTime decimal(7, 3) NULL,
        Q5RecallTime decimal(7, 3) NULL,
        Q5ReaderStart datetimeoffset(7) NULL,
        Q5ReaderEnd datetimeoffset(7) NULL,
        Q6ID nvarchar(16) NULL,
        Q6Response nvarchar(60) NULL,
        Q6InputMethods nvarchar(16) NULL,
        Q6K nvarchar(max) NULL,
        Q6Sco tinyint NULL,
        Q6ResponseTime decimal(7, 3) NULL,
        Q6TimeOut tinyint NULL,
        Q6TimeOutResponse tinyint NULL,
        Q6TimeOutSco tinyint NULL,
        Q6tLoad datetimeoffset(7) NULL,
        Q6tFirstKey datetimeoffset(7) NULL,
        Q6tLastKey datetimeoffset(7) NULL,
        Q6OverallTime decimal(7, 3) NULL,
        Q6RecallTime decimal(7, 3) NULL,
        Q6ReaderStart datetimeoffset(7) NULL,
        Q6ReaderEnd datetimeoffset(7) NULL,
        Q7ID nvarchar(16) NULL,
        Q7Response nvarchar(60) NULL,
        Q7InputMethods nvarchar(16) NULL,
        Q7K nvarchar(max) NULL,
        Q7Sco tinyint NULL,
        Q7ResponseTime decimal(7, 3) NULL,
        Q7TimeOut tinyint NULL,
        Q7TimeOutResponse tinyint NULL,
        Q7TimeOutSco tinyint NULL,
        Q7tLoad datetimeoffset(7) NULL,
        Q7tFirstKey datetimeoffset(7) NULL,
        Q7tLastKey datetimeoffset(7) NULL,
        Q7OverallTime decimal(7, 3) NULL,
        Q7RecallTime decimal(7, 3) NULL,
        Q7ReaderStart datetimeoffset(7) NULL,
        Q7ReaderEnd datetimeoffset(7) NULL,
        Q8ID nvarchar(16) NULL,
        Q8Response nvarchar(60) NULL,
        Q8InputMethods nvarchar(16) NULL,
        Q8K nvarchar(max) NULL,
        Q8Sco tinyint NULL,
        Q8ResponseTime decimal(7, 3) NULL,
        Q8TimeOut tinyint NULL,
        Q8TimeOutResponse tinyint NULL,
        Q8TimeOutSco tinyint NULL,
        Q8tLoad datetimeoffset(7) NULL,
        Q8tFirstKey datetimeoffset(7) NULL,
        Q8tLastKey datetimeoffset(7) NULL,
        Q8OverallTime decimal(7, 3) NULL,
        Q8RecallTime decimal(7, 3) NULL,
        Q8ReaderStart datetimeoffset(7) NULL,
        Q8ReaderEnd datetimeoffset(7) NULL,
        Q9ID nvarchar(16) NULL,
        Q9Response nvarchar(60) NULL,
        Q9InputMethods nvarchar(16) NULL,
        Q9K nvarchar(max) NULL,
        Q9Sco tinyint NULL,
        Q9ResponseTime decimal(7, 3) NULL,
        Q9TimeOut tinyint NULL,
        Q9TimeOutResponse tinyint NULL,
        Q9TimeOutSco tinyint NULL,
        Q9tLoad datetimeoffset(7) NULL,
        Q9tFirstKey datetimeoffset(7) NULL,
        Q9tLastKey datetimeoffset(7) NULL,
        Q9OverallTime decimal(7, 3) NULL,
        Q9RecallTime decimal(7, 3) NULL,
        Q9ReaderStart datetimeoffset(7) NULL,
        Q9ReaderEnd datetimeoffset(7) NULL,
        Q10ID nvarchar(16) NULL,
        Q10Response nvarchar(60) NULL,
        Q10InputMethods nvarchar(16) NULL,
        Q10K nvarchar(max) NULL,
        Q10Sco tinyint NULL,
        Q10ResponseTime decimal(7, 3) NULL,
        Q10TimeOut tinyint NULL,
        Q10TimeOutResponse tinyint NULL,
        Q10TimeOutSco tinyint NULL,
        Q10tLoad datetimeoffset(7) NULL,
        Q10tFirstKey datetimeoffset(7) NULL,
        Q10tLastKey datetimeoffset(7) NULL,
        Q10OverallTime decimal(7, 3) NULL,
        Q10RecallTime decimal(7, 3) NULL,
        Q10ReaderStart datetimeoffset(7) NULL,
        Q10ReaderEnd datetimeoffset(7) NULL,
        Q11ID nvarchar(16) NULL,
        Q11Response nvarchar(60) NULL,
        Q11InputMethods nvarchar(16) NULL,
        Q11K nvarchar(max) NULL,
        Q11Sco tinyint NULL,
        Q11ResponseTime decimal(7, 3) NULL,
        Q11TimeOut tinyint NULL,
        Q11TimeOutResponse tinyint NULL,
        Q11TimeOutSco tinyint NULL,
        Q11tLoad datetimeoffset(7) NULL,
        Q11tFirstKey datetimeoffset(7) NULL,
        Q11tLastKey datetimeoffset(7) NULL,
        Q11OverallTime decimal(7, 3) NULL,
        Q11RecallTime decimal(7, 3) NULL,
        Q11ReaderStart datetimeoffset(7) NULL,
        Q11ReaderEnd datetimeoffset(7) NULL,
        Q12ID nvarchar(16) NULL,
        Q12Response nvarchar(60) NULL,
        Q12InputMethods nvarchar(16) NULL,
        Q12K nvarchar(max) NULL,
        Q12Sco tinyint NULL,
        Q12ResponseTime decimal(7, 3) NULL,
        Q12TimeOut tinyint NULL,
        Q12TimeOutResponse tinyint NULL,
        Q12TimeOutSco tinyint NULL,
        Q12tLoad datetimeoffset(7) NULL,
        Q12tFirstKey datetimeoffset(7) NULL,
        Q12tLastKey datetimeoffset(7) NULL,
        Q12OverallTime decimal(7, 3) NULL,
        Q12RecallTime decimal(7, 3) NULL,
        Q12ReaderStart datetimeoffset(7) NULL,
        Q12ReaderEnd datetimeoffset(7) NULL,
        Q13ID nvarchar(16) NULL,
        Q13Response nvarchar(60) NULL,
        Q13InputMethods nvarchar(16) NULL,
        Q13K nvarchar(max) NULL,
        Q13Sco tinyint NULL,
        Q13ResponseTime decimal(7, 3) NULL,
        Q13TimeOut tinyint NULL,
        Q13TimeOutResponse tinyint NULL,
        Q13TimeOutSco tinyint NULL,
        Q13tLoad datetimeoffset(7) NULL,
        Q13tFirstKey datetimeoffset(7) NULL,
        Q13tLastKey datetimeoffset(7) NULL,
        Q13OverallTime decimal(7, 3) NULL,
        Q13RecallTime decimal(7, 3) NULL,
        Q13ReaderStart datetimeoffset(7) NULL,
        Q13ReaderEnd datetimeoffset(7) NULL,
        Q14ID nvarchar(16) NULL,
        Q14Response nvarchar(60) NULL,
        Q14InputMethods nvarchar(16) NULL,
        Q14K nvarchar(max) NULL,
        Q14Sco tinyint NULL,
        Q14ResponseTime decimal(7, 3) NULL,
        Q14TimeOut tinyint NULL,
        Q14TimeOutResponse tinyint NULL,
        Q14TimeOutSco tinyint NULL,
        Q14tLoad datetimeoffset(7) NULL,
        Q14tFirstKey datetimeoffset(7) NULL,
        Q14tLastKey datetimeoffset(7) NULL,
        Q14OverallTime decimal(7, 3) NULL,
        Q14RecallTime decimal(7, 3) NULL,
        Q14ReaderStart datetimeoffset(7) NULL,
        Q14ReaderEnd datetimeoffset(7) NULL,
        Q15ID nvarchar(16) NULL,
        Q15Response nvarchar(60) NULL,
        Q15InputMethods nvarchar(16) NULL,
        Q15K nvarchar(max) NULL,
        Q15Sco tinyint NULL,
        Q15ResponseTime decimal(7, 3) NULL,
        Q15TimeOut tinyint NULL,
        Q15TimeOutResponse tinyint NULL,
        Q15TimeOutSco tinyint NULL,
        Q15tLoad datetimeoffset(7) NULL,
        Q15tFirstKey datetimeoffset(7) NULL,
        Q15tLastKey datetimeoffset(7) NULL,
        Q15OverallTime decimal(7, 3) NULL,
        Q15RecallTime decimal(7, 3) NULL,
        Q15ReaderStart datetimeoffset(7) NULL,
        Q15ReaderEnd datetimeoffset(7) NULL,
        Q16ID nvarchar(16) NULL,
        Q16Response nvarchar(60) NULL,
        Q16InputMethods nvarchar(16) NULL,
        Q16K nvarchar(max) NULL,
        Q16Sco tinyint NULL,
        Q16ResponseTime decimal(7, 3) NULL,
        Q16TimeOut tinyint NULL,
        Q16TimeOutResponse tinyint NULL,
        Q16TimeOutSco tinyint NULL,
        Q16tLoad datetimeoffset(7) NULL,
        Q16tFirstKey datetimeoffset(7) NULL,
        Q16tLastKey datetimeoffset(7) NULL,
        Q16OverallTime decimal(7, 3) NULL,
        Q16RecallTime decimal(7, 3) NULL,
        Q16ReaderStart datetimeoffset(7) NULL,
        Q16ReaderEnd datetimeoffset(7) NULL,
        Q17ID nvarchar(16) NULL,
        Q17Response nvarchar(60) NULL,
        Q17InputMethods nvarchar(16) NULL,
        Q17K nvarchar(max) NULL,
        Q17Sco tinyint NULL,
        Q17ResponseTime decimal(7, 3) NULL,
        Q17TimeOut tinyint NULL,
        Q17TimeOutResponse tinyint NULL,
        Q17TimeOutSco tinyint NULL,
        Q17tLoad datetimeoffset(7) NULL,
        Q17tFirstKey datetimeoffset(7) NULL,
        Q17tLastKey datetimeoffset(7) NULL,
        Q17OverallTime decimal(7, 3) NULL,
        Q17RecallTime decimal(7, 3) NULL,
        Q17ReaderStart datetimeoffset(7) NULL,
        Q17ReaderEnd datetimeoffset(7) NULL,
        Q18ID nvarchar(16) NULL,
        Q18Response nvarchar(60) NULL,
        Q18InputMethods nvarchar(16) NULL,
        Q18K nvarchar(max) NULL,
        Q18Sco tinyint NULL,
        Q18ResponseTime decimal(7, 3) NULL,
        Q18TimeOut tinyint NULL,
        Q18TimeOutResponse tinyint NULL,
        Q18TimeOutSco tinyint NULL,
        Q18tLoad datetimeoffset(7) NULL,
        Q18tFirstKey datetimeoffset(7) NULL,
        Q18tLastKey datetimeoffset(7) NULL,
        Q18OverallTime decimal(7, 3) NULL,
        Q18RecallTime decimal(7, 3) NULL,
        Q18ReaderStart datetimeoffset(7) NULL,
        Q18ReaderEnd datetimeoffset(7) NULL,
        Q19ID nvarchar(16) NULL,
        Q19Response nvarchar(60) NULL,
        Q19InputMethods nvarchar(16) NULL,
        Q19K nvarchar(max) NULL,
        Q19Sco tinyint NULL,
        Q19ResponseTime decimal(7, 3) NULL,
        Q19TimeOut tinyint NULL,
        Q19TimeOutResponse tinyint NULL,
        Q19TimeOutSco tinyint NULL,
        Q19tLoad datetimeoffset(7) NULL,
        Q19tFirstKey datetimeoffset(7) NULL,
        Q19tLastKey datetimeoffset(7) NULL,
        Q19OverallTime decimal(7, 3) NULL,
        Q19RecallTime decimal(7, 3) NULL,
        Q19ReaderStart datetimeoffset(7) NULL,
        Q19ReaderEnd datetimeoffset(7) NULL,
        Q20ID nvarchar(16) NULL,
        Q20Response nvarchar(60) NULL,
        Q20InputMethods nvarchar(16) NULL,
        Q20K nvarchar(max) NULL,
        Q20Sco tinyint NULL,
        Q20ResponseTime decimal(7, 3) NULL,
        Q20TimeOut tinyint NULL,
        Q20TimeOutResponse tinyint NULL,
        Q20TimeOutSco tinyint NULL,
        Q20tLoad datetimeoffset(7) NULL,
        Q20tFirstKey datetimeoffset(7) NULL,
        Q20tLastKey datetimeoffset(7) NULL,
        Q20OverallTime decimal(7, 3) NULL,
        Q20RecallTime decimal(7, 3) NULL,
        Q20ReaderStart datetimeoffset(7) NULL,
        Q20ReaderEnd datetimeoffset(7) NULL,
        Q21ID nvarchar(16) NULL,
        Q21Response nvarchar(60) NULL,
        Q21InputMethods nvarchar(16) NULL,
        Q21K nvarchar(max) NULL,
        Q21Sco tinyint NULL,
        Q21ResponseTime decimal(7, 3) NULL,
        Q21TimeOut tinyint NULL,
        Q21TimeOutResponse tinyint NULL,
        Q21TimeOutSco tinyint NULL,
        Q21tLoad datetimeoffset(7) NULL,
        Q21tFirstKey datetimeoffset(7) NULL,
        Q21tLastKey datetimeoffset(7) NULL,
        Q21OverallTime decimal(7, 3) NULL,
        Q21RecallTime decimal(7, 3) NULL,
        Q21ReaderStart datetimeoffset(7) NULL,
        Q21ReaderEnd datetimeoffset(7) NULL,
        Q22ID nvarchar(16) NULL,
        Q22Response nvarchar(60) NULL,
        Q22InputMethods nvarchar(16) NULL,
        Q22K nvarchar(max) NULL,
        Q22Sco tinyint NULL,
        Q22ResponseTime decimal(7, 3) NULL,
        Q22TimeOut tinyint NULL,
        Q22TimeOutResponse tinyint NULL,
        Q22TimeOutSco tinyint NULL,
        Q22tLoad datetimeoffset(7) NULL,
        Q22tFirstKey datetimeoffset(7) NULL,
        Q22tLastKey datetimeoffset(7) NULL,
        Q22OverallTime decimal(7, 3) NULL,
        Q22RecallTime decimal(7, 3) NULL,
        Q22ReaderStart datetimeoffset(7) NULL,
        Q22ReaderEnd datetimeoffset(7) NULL,
        Q23ID nvarchar(16) NULL,
        Q23Response nvarchar(60) NULL,
        Q23InputMethods nvarchar(16) NULL,
        Q23K nvarchar(max) NULL,
        Q23Sco tinyint NULL,
        Q23ResponseTime decimal(7, 3) NULL,
        Q23TimeOut tinyint NULL,
        Q23TimeOutResponse tinyint NULL,
        Q23TimeOutSco tinyint NULL,
        Q23tLoad datetimeoffset(7) NULL,
        Q23tFirstKey datetimeoffset(7) NULL,
        Q23tLastKey datetimeoffset(7) NULL,
        Q23OverallTime decimal(7, 3) NULL,
        Q23RecallTime decimal(7, 3) NULL,
        Q23ReaderStart datetimeoffset(7) NULL,
        Q23ReaderEnd datetimeoffset(7) NULL,
        Q24ID nvarchar(16) NULL,
        Q24Response nvarchar(60) NULL,
        Q24InputMethods nvarchar(16) NULL,
        Q24K nvarchar(max) NULL,
        Q24Sco tinyint NULL,
        Q24ResponseTime decimal(7, 3) NULL,
        Q24TimeOut tinyint NULL,
        Q24TimeOutResponse tinyint NULL,
        Q24TimeOutSco tinyint NULL,
        Q24tLoad datetimeoffset(7) NULL,
        Q24tFirstKey datetimeoffset(7) NULL,
        Q24tLastKey datetimeoffset(7) NULL,
        Q24OverallTime decimal(7, 3) NULL,
        Q24RecallTime decimal(7, 3) NULL,
        Q24ReaderStart datetimeoffset(7) NULL,
        Q24ReaderEnd datetimeoffset(7) NULL,
        Q25ID nvarchar(16) NULL,
        Q25Response nvarchar(60) NULL,
        Q25InputMethods nvarchar(16) NULL,
        Q25K nvarchar(max) NULL,
        Q25Sco tinyint NULL,
        Q25ResponseTime decimal(7, 3) NULL,
        Q25TimeOut tinyint NULL,
        Q25TimeOutResponse tinyint NULL,
        Q25TimeOutSco tinyint NULL,
        Q25tLoad datetimeoffset(7) NULL,
        Q25tFirstKey datetimeoffset(7) NULL,
        Q25tLastKey datetimeoffset(7) NULL,
        Q25OverallTime decimal(7, 3) NULL,
        Q25RecallTime decimal(7, 3) NULL,
        Q25ReaderStart datetimeoffset(7) NULL,
        Q25ReaderEnd datetimeoffset(7) NULL,
        ReasonNotTakingCheck char(1) NULL,
        ToECode int NULL,
        ImportedFromCensus bit NOT NULL DEFAULT (0),
        CONSTRAINT PK_psychometricReport PRIMARY KEY (PupilId)
    )
END

GO

CREATE OR ALTER TRIGGER [mtc_results].[psychometricReportUpdatedAtTrigger]
    ON [mtc_results].[psychometricReport]
    AFTER UPDATE AS
    BEGIN
        UPDATE [mtc_results].[psychometricReport]
        SET updatedAt = GETUTCDATE()
    FROM inserted
        WHERE [psychometricReport].PupilId = inserted.PupilId
    END
