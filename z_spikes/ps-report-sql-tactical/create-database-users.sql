
USE [psreportpoc]
CREATE USER [mtcanalysis01] FOR LOGIN [mtcanalysis01] WITH DEFAULT_SCHEMA = mtc_analysis;
ALTER ROLE db_datareader ADD MEMBER [mtcanalysis01];

CREATE USER [mtcanalysis02] FOR LOGIN [mtcanalysis02] WITH DEFAULT_SCHEMA = mtc_analysis;
ALTER ROLE db_datareader ADD MEMBER [mtcanalysis02];