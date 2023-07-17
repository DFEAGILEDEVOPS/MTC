import { ServiceManagerAttendanceService } from './service-manager.attendance.service'
import { ServiceManagerAttendanceDataService, type AttendanceCodeVisibility } from './service-manager.attendance.data.service'

describe('service manager attendance service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('setVisibleAttendanceCodes', () => {
    test('updates each and every attendance code', async () => {
      const attendanceCodesToBeVisible = ['ABCDE', 'FGHIJ']
      const attendanceCodesToBeInvisible = ['KLMNO', 'PQRST', 'UVWXY']
      const allAttendanceCodes = attendanceCodesToBeVisible.concat(attendanceCodesToBeInvisible)
      jest.spyOn(ServiceManagerAttendanceDataService, 'getAttendanceCodes')
        .mockResolvedValue(allAttendanceCodes.map((code, index) => ({
          id: index,
          reason: 'reason',
          code,
          order: index,
          visible: true
        })))
      const setVisibilityDataServiceSpy = jest.spyOn(ServiceManagerAttendanceDataService, 'setVisibility').mockResolvedValue()

      await ServiceManagerAttendanceService.setVisibleAttendanceCodes(attendanceCodesToBeVisible)
      const expectedSet = new Array<AttendanceCodeVisibility>()
      expectedSet.push({ code: 'ABCDE', visible: true })
      expectedSet.push({ code: 'FGHIJ', visible: true })
      expectedSet.push({ code: 'KLMNO', visible: false })
      expectedSet.push({ code: 'PQRST', visible: false })
      expectedSet.push({ code: 'UVWXY', visible: false })

      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith(expectedSet)
    })

    test('if none visible, sets all to not visible', async () => {
      const allAttendanceCodes = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY']
      jest.spyOn(ServiceManagerAttendanceDataService, 'getAttendanceCodes')
        .mockResolvedValue(allAttendanceCodes.map((code, index) => ({
          id: index,
          reason: 'reason',
          code,
          order: index,
          visible: true
        })))
      const setVisibilityDataServiceSpy = jest.spyOn(ServiceManagerAttendanceDataService, 'setVisibility').mockResolvedValue()

      await ServiceManagerAttendanceService.setVisibleAttendanceCodes(undefined)

      const expectedSet = new Array<AttendanceCodeVisibility>()
      expectedSet.push({ code: 'ABCDE', visible: false })
      expectedSet.push({ code: 'FGHIJ', visible: false })
      expectedSet.push({ code: 'KLMNO', visible: false })
      expectedSet.push({ code: 'PQRST', visible: false })
      expectedSet.push({ code: 'UVWXY', visible: false })

      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith(expectedSet)
    })
  })
})
