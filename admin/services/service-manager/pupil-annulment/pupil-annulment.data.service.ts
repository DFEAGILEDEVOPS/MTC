
export class PupilAnnulmentDataService {
 static async setAnnulmentByUrlSlug (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    // get attendance code id
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
