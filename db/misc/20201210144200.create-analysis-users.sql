/* example script for creating analysis users and assigning to roles */

CREATE USER [analysisUser1] WITH PASSWORD='', DEFAULT_SCHEMA=[mtc_analysis]
CREATE USER [analysisanalysisUser2] WITH PASSWORD='', DEFAULT_SCHEMA=[mtc_analysis]
CREATE USER [analysisUser3] WITH PASSWORD='', DEFAULT_SCHEMA=[mtc_analysis]
CREATE USER [analysisUser4] WITH PASSWORD='', DEFAULT_SCHEMA=[mtc_analysis]
CREATE USER [analysisUser5] WITH PASSWORD='', DEFAULT_SCHEMA=[mtc_analysis]

ALTER ROLE [data_analysis_role]
  ADD MEMBER analysisUser1

ALTER ROLE [data_analysis_role]
  ADD MEMBER analysisUser2

ALTER ROLE [data_analysis_role]
  ADD MEMBER analysisUser3

ALTER ROLE [data_analysis_role]
  ADD MEMBER analysisUser4

ALTER ROLE [data_analysis_role]
  ADD MEMBER analysisUser5
