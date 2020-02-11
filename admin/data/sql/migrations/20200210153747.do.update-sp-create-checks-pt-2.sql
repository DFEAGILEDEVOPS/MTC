-- DROP PROCEDURE IN ORDER TO RECREATE THE CHECK TABLE TYPE
DROP PROCEDURE IF EXISTS [mtc_admin].[spCreateChecks];
DROP TYPE IF EXISTS [mtc_admin].[checkTableType];

CREATE TYPE [mtc_admin].[checkTableType] AS TABLE (
  pupil_id int,
  checkForm_id int,
  checkWindow_id int,
  isLiveCheck bit,
  pinExpiresAtUtc datetimeoffset(3),
  pinValidFromUtc datetimeoffset(3),
  school_id int
);

