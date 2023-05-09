import { AttendanceCode, ServiceManagerAttendanceDataService } from './service-manager.attendance.data.service'

export class ServiceManagerAttendanceService {
  static async getAttendanceCodes (): Promise<AttendanceCode[]> {
    return ServiceManagerAttendanceDataService.getAttendanceCodes()
  }
}
