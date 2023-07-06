import { type AttendanceCode, type AttendanceCodeVisibility, ServiceManagerAttendanceDataService } from './service-manager.attendance.data.service'

export class ServiceManagerAttendanceService {
  static async getAttendanceCodes (): Promise<AttendanceCode[]> {
    return ServiceManagerAttendanceDataService.getAttendanceCodes()
  }

  /**
   * @description Sets the visibility of the attendance codes to true if they are included in the set.
   * All other non privileged attendance codes will be set to not visible.
   * @param visibleAttendanceCodes - The attendance codes to be visible
   */
  static async setVisibleAttendanceCodes (visibleAttendanceCodes: string[] | undefined): Promise<void> {
    if (!visibleAttendanceCodes || visibleAttendanceCodes.length === 0) {
      visibleAttendanceCodes = []
    }
    const codes = new Array<AttendanceCodeVisibility>()
    const allAttendanceCodes = await ServiceManagerAttendanceDataService.getAttendanceCodes()
    for (const attendanceCode of allAttendanceCodes) {
      const visible = visibleAttendanceCodes.includes(attendanceCode.code)
      codes.push({
        code: attendanceCode.code,
        visible
      })
    }
    await ServiceManagerAttendanceDataService.setVisibility(codes)
  }
}
