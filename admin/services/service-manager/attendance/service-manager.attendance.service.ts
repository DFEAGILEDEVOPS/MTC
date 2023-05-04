import { AttendanceCode, ServiceManagerAttendanceDataService } from './service-manager.attendance.data.service'

export class ServiceManagerAttendanceService {
  static async getAttendanceCodes (): Promise<AttendanceCode[]> {
    return ServiceManagerAttendanceDataService.getAttendanceCodes()
  }

  static async toggleVisibility (attendanceCodeId: number, visible: boolean): Promise<void> {
    await ServiceManagerAttendanceDataService.toggleVisibility(attendanceCodeId, visible)
  }
}
