import { ServiceManagerAttendanceService } from './service-manager.attendance.service'
import { ServiceManagerAttendanceDataService } from './service-manager.attendance.data.service'

describe('service manager attendance service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('bulkUpdateAttendanceCodesVisibility', () => {
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

      expect(setVisibilityDataServiceSpy).toHaveBeenCalledTimes(allAttendanceCodes.length)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('ABCDE', true)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('FGHIJ', true)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('KLMNO', false)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('PQRST', false)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('UVWXY', false)
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

      expect(setVisibilityDataServiceSpy).toHaveBeenCalledTimes(allAttendanceCodes.length)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('ABCDE', false)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('FGHIJ', false)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('KLMNO', false)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('PQRST', false)
      expect(setVisibilityDataServiceSpy).toHaveBeenCalledWith('UVWXY', false)
    })
  })
})
