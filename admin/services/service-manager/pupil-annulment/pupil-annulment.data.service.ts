import sqlService, { TYPES } from '../../../services/data-access/sql.service'

export class PupilAnnulmentDataService {
  public static readonly annulmentCode = 'ANLLD'

  static async setAnnulmentByUrlSlug (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    const params = [{
      name: 'annuledAttendanceCode',
      type: TYPES.Char(5),
      value: PupilAnnulmentDataService.annulmentCode
    }, {
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }, {
      name: 'userId',
      type: TYPES.Int,
      value: currentUserId
    }]
    const sql = `
    -- Pupil Annulment transaction

    DECLARE @attendanceCode_id Int = (SELECT id from [mtc_admin].[attendanceCode] where code = @annuledAttendanceCode)
    DECLARE @pupilId Int = (SELECT id from [mtc_admin].[pupil] where urlSlug = @pupilUrlSlug)

    IF @attendanceCode_id IS NULL
      THROW 51000, 'unknown attendanceCode.code', 1;

    DECLARE @currentPupilCheckCompleteValue bit
    DECLARE @currentPupilRestartAvailableValue bit
    DECLARE @currentAttendanceId int

    SELECT
      @currentPupilCheckCompleteValue = checkComplete,
      @currentPupilRestartAvailableValue = restartAvailable
    FROM
      [mtc_admin].[pupil]
    WHERE
      id = @pupilId

    -- get id of any unconsumed restart
    DECLARE @currentUnconsumedRestartId int

    SELECT TOP 1
      @currentUnconsumedRestartId = pr.id
    FROM
      [mtc_admin].[pupilRestart] pr
    WHERE
      pr.isDeleted = 0
    AND
      pr.pupil_id = @pupilId
    AND
      pr.check_id IS NULL
    ORDER BY 1 DESC

    -- get id of any active attendance
    DECLARE @currentPupilAttendanceId int

    SELECT TOP 1
      @currentPupilAttendanceId = pa.id
    FROM
      [mtc_admin].[pupilAttendance] pa
    WHERE
      pa.isDeleted = 0
    AND
      pa.pupil_id = @pupilId
    ORDER BY 1 desc

    -- soft delete any existing attendance for pupil
    UPDATE
      [mtc_admin].[pupilAttendance]
    SET
      isDeleted=1
    WHERE
      pupil_id=@pupilId
    AND
      id = @currentPupilAttendanceId

    -- soft delete any unconsumed restarts
    UPDATE
      [mtc_admin].[pupilRestart]
    SET
      isDeleted = 1,
      deletedByUser_id = @userId
    FROM
      [mtc_admin].[pupil]
    WHERE
      isDeleted  = 0
    AND
      pupil_id = @pupilId
    AND
      check_id IS NULL

    -- create new attendance record for annulment, with rollback info
    INSERT
      mtc_admin.[pupilAttendance]
      (
        recordedBy_user_id,
        attendanceCode_id,
        pupil_id,
        previousCheckCompleteValue,
        previousRestartAvailableValue,
        previousAttendanceId,
        previousRestartId
      )
    VALUES
      (
        @userId,
        @attendanceCode_id,
        @pupilId,
        @currentPupilCheckCompleteValue,
        @currentPupilRestartAvailableValue,
        @currentPupilAttendanceId,
        @currentUnconsumedRestartId
      )

    -- update pupil record with annulment and freeze
    UPDATE
      mtc_admin.[pupil]
    SET
      attendanceId=@attendanceCode_id,
      frozen=1,
      checkComplete=0,
      restartAvailable=0
    WHERE
      id=@pupilId
    `
    // get previously active restart record id and attendance record id for rollback
    // delete unconsumed restarts
    return sqlService.modifyWithTransaction(sql, params)
  }

  static async undoAnnulmentByUrlSlug (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    const params = [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    },
    {
      name: 'userId',
      type: TYPES.Int,
      value: currentUserId
    },
    {
      name: 'annuledAttendanceCode',
      type: TYPES.Char(5),
      value: PupilAnnulmentDataService.annulmentCode
    }]

    const sql = `
    DECLARE @attendanceCode_id Int = (SELECT id from [mtc_admin].[attendanceCode] where code = @annuledAttendanceCode)
    DECLARE @pupilId Int = (SELECT id from [mtc_admin].[pupil] where urlSlug = @pupilUrlSlug)

    -- get values of rollback info into variables
    DECLARE @previousCheckCompleteValue bit
    DECLARE @previousRestartAvailableValue bit
    DECLARE @previousPupilAttendanceId int
    DECLARE @previousRestartId int
    DECLARE @annulmentPupilAttendanceId int
    DECLARE @previousAttendanceId

    SELECT
      @previousAttendanceId = attendanceCode_id
    FROM
      [mtc_admin].[pupilAttendance]
    WHERE
      id = @previousPupilAttendanceId

    SELECT
      @annulmentPupilAttendanceId = pa.id
      @previousCheckCompleteValue = pa.previousCheckCompleteValue,
      @previousRestartAvailableValue = pa.previousRestartAvailableValue,
      @previousPupilAttendanceId = pa.previousAttendanceId,
      @previousRestartId = pa.previousRestartId
    FROM
      [mtc_admin].[pupilAttendance] pa
    WHERE
      pa.pupil_id = @pupilId
    AND
      pa.attendanceCode_id = @attendanceCode_id
    AND
      pa.isDeleted = 0

    -- soft delete pupilAttendanceRecord for annulment
    UPDATE
      [mtc_admin].[pupilAttendance]
    SET
      isDeleted=1
    WHERE
      id = @annulmentPupilAttendanceId

    -- set previous attendance, restartAvailable & completeCheck, frozen=0 on pupil record
    UPDATE
      [mtc_admin].[pupil]
    SET
      frozen = 0,
      checkComplete = @previousCheckComplete,
      restartAvailable = @previousRestartAvailable,
      attendanceId = @previousAttendanceCode
    WHERE
      id = @pupilId

    -- if previous attendanceId, undo soft delete, set pupil.attendanceId
    IF @previousPupilAttendanceId IS NOT NULL
      BEGIN
        UPDATE
          [mtc_admin].[pupilAttendance]
        SET
          isDeleted = 0
        WHERE
          id = @previousPupilAttendanceId
      END

    -- if previous pupilRestartId, undo soft delete
    IF @previousRestartId IS NOT NULL
      BEGIN
        UPDATE
          [mtc_admin].[pupilRestart]
        SET
          isDeleted = 0
        WHERE
          id = @previousRestartId
      END

    `
  }
}
