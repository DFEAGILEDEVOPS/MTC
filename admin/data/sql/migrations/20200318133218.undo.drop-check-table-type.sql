CREATE TYPE [mtc_admin].[checkTableType] AS TABLE (
  pupil_id int,
  checkForm_id int,
  checkWindow_id int,
  isLiveCheck bit,
  pinExpiresAt datetimeoffset(3),
  school_id int
);
