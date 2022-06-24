import { TYPES } from '../../../services/data-access/sql.service'

export class PupilAnnulmentDataService {
  public static readonly annulmentCode = 'ANLLD'

  static async setAnnulmentByUrlSlug (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    // does the pupil have existing attendance? if yes, soft delete?
    // get attendance code id
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

    DECLARE @attendanceCode_id Int = (SELECT id from [mtc_admin].[attendanceCode] where code = @code);
    DECLARE @pupilId Int = (SELECT id from [mtc_admin].[pupil] where urlSlug = @pupilUrlSlug);

    IF @attendanceCode_id IS NULL
      THROW 51000, 'unknown attendanceCode.code', 1;

    -- soft delete any existing attendance for pupil
    UPDATE mtc_admin.[pupilAttendance] SET isDeleted=1 WHERE pupil_id=@pupilId

    -- create new attendance record for annulment, with rollback info
    INSERT mtc_admin.[pupilAttendance] (recordedBy_user_id, attendanceCode_id, pupil_id)
    VALUES (@userId, @attendanceCode_id, @pupilId)

    -- update pupil record with annulment and freeze
    UPDATE mtc_admin.[pupil]
    SET
      attendanceId=@attendanceCode_id,
      frozen=1,
      checkComplete=0,
      restartAvailable=0
    WHERE id=@pupilId
    `
    // soft delete and make new attendance record?
    // set pupil record (attendanceId, restartAvailable=0, checkComplete=0, frozen=1)
    // delete unconsumed restarts
  }

  static async undoAnnulmentByUrlSlug (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    // set pupilAttendance record to deleted
    // update pupil record to attendanceId=NULL
    // update pupil record to frozen=0 IF we are not preserving the freeze
  }
}
