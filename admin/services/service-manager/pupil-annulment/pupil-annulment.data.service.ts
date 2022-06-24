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
        previousPupilCheckCompleteValue,
        previousRestartAvailableValue,
        previousPupilAttendanceId,
        previousPupilRestartId
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
    // set pupilAttendance record to deleted
    // update pupil record to attendanceId=NULL
    // update pupil record to frozen=0 IF we are not preserving the freeze
  }
}
