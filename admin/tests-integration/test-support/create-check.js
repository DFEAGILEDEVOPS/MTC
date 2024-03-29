'use strict'

const sqlService = require('../../services/data-access/sql.service')

const createCheck = async function createCheck (code, isLiveCheck) {
  const sql = `
      declare @tvp as [mtc_admin].CheckTableType;
      declare @pupilId int,
              @schoolId int;
      declare @checkFormId int = (select top 1 id from [mtc_admin].[checkForm] where isDeleted = 0 and isLiveCheckForm = 1);
      declare @checkWindowId int = (select top 1 id from [mtc_admin].[checkWindow] where isDeleted = 0 order by adminEndDate Desc);
      declare @endOfDay datetimeoffset = (select dateadd(ms, -3, dateadd(day, datediff(day, 0, getutcdate()), 1)));

      select
        top 1
        @pupilId = id,
        @schoolId = school_id
      from
        [mtc_admin].[vewPupilsEligibleForLivePinGeneration];

      INSERT into @tvp
        (pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id)
        VALUES
        (@pupilId, @checkFormId, @checkWindowId, ${isLiveCheck}, @endOfDay, @schoolId);

      EXEC [mtc_admin].[spCreateChecks] @tvp;
  `

  let res, checkId

  try {
    res = await sqlService.modifyWithResponse(sql)
    checkId = res.response[0].check_id
  } catch (error) {
    console.log(`Failed to createCheck() for SQL:\n${sql}\nError was: ${error.message}`)
  }

  if (code === 'COL') {
    const sql = `UPDATE [mtc_admin].[check]
                 set pupilLoginDate = GETUTCDATE()
                 where id = ${checkId}`
    await sqlService.modify(sql)
  }

  // These modification to the base check are meant to represent canonical
  // representations of the check in various status's.
  if (code === 'CMP') {
    const sql = `UPDATE [mtc_admin].[check]
                 set pupilLoginDate = GETUTCDATE(),
                     receivedByServerAt = GETUTCDATE(),
                     complete = 1,
                     completedAt = GETUTCDATE(),
                     received = 1
                 where id = ${checkId};`
    await sqlService.modifyWithTransaction(sql)
  }

  if (code === 'EXP1') {
    // Expire the pin
    const sql = `UPDATE [mtc_admin].[checkPin]
                 SET pinExpiresAt = DATEADD(day, -1, pinExpiresAt)
                 WHERE check_id = ${checkId}
                `
    await sqlService.modify(sql)
  }

  if (code === 'EXP2') {
    // Delete the pin
    const sql = `DELETE FROM [mtc_admin].[checkPin]
                 WHERE check_id = ${checkId}
                `
    await sqlService.modify(sql)
  }

  if (code === 'NTR1') {
    // Not received
    const sql = `UPDATE [mtc_admin].[check]
                 SET pupilLoginDate = DATEADD(minute, -32, GETUTCDATE())
                 WHERE id = ${checkId}
                 `
    await sqlService.modify(sql)
  }

  if (code === 'NTR2') {
    // Not received
    const sql = `UPDATE [mtc_admin].[check]
                 SET pupilLoginDate = DATEADD(minute, -32, GETUTCDATE())
                 WHERE id = ${checkId}
                 `
    await sqlService.modify(sql)
  }

  if (code === 'ERR' && isLiveCheck === 1) {
    const sql = `UPDATE [mtc_admin].[check]
                 SET pupilLoginDate= GETUTCDATE(),
                     received = 1,
                     receivedByServerAt = GETUTCDATE(),
                     processingFailed = 1
                 WHERE id = ${checkId}`
    await sqlService.modifyWithTransaction(sql)
  }

  return checkId
}

module.exports = createCheck
