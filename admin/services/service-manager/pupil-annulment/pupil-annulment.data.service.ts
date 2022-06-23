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

    INSERT into #pupilsToSet (slug, attendanceCode_id, recordedBy_user_id)
    VALUES (@pupilUrlSlug, @annuledAttendanceCode, @userId);
    --
    -- Mark pupils as not attending
    --

    DECLARE @attendanceCode_id Int = (SELECT id from [mtc_admin].[attendanceCode] where code = @code AND isPrivileged = 0);

    IF @attendanceCode_id IS NULL
      THROW 51000, 'unknown attendanceCode.code', 1;

    `
    // insert or update attendance record? or delete and make new one?
    // set pupil record (attendanceId, restartAvailable=0, checkComplete=0, frozen=1)
    // delete unconsumed restarts
  }

  static async undoAnnulmentByUrlSlug (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    // set pupilAttendance record to deleted
    // update pupil record to attendanceId=NULL
    // update pupil record to frozen=0 IF we are not preserving the freeze
  }
}
