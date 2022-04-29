import { ServiceManagerPupilService } from './service-manager.pupil.service'
import { ServiceManagerPupilDataService } from './service-manager.pupil.data.service'

const validUpn = 'ThirteenChar5'

describe('service manager pupil service', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('findPupilByUpn', () => {
    test('error is thrown if upn is undefined', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn(undefined)).rejects.toThrow('upn is required')
    })
    test('error is thrown if upn is empty string', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn('')).rejects.toThrow('upn is required')
    })
    test('error is thrown if upn is not 13 chars in length', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn('twelvecharss')).rejects.toThrow('upn should be 13 characters and numbers')
    })
    test('error is thrown if upn contains non alphanumeric characters', async () => {
      await expect(ServiceManagerPupilService.findPupilByUpn('this-is-badd&')).rejects.toThrow('upn should only contain alphanumeric characters')
    })
    test('passes validation if no issues with input', async () => {
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockImplementation()
      await ServiceManagerPupilService.findPupilByUpn(validUpn)
      expect(ServiceManagerPupilDataService.findPupilByUpn).toHaveBeenCalledTimes(1)
    })

    test('forces uppercase of UPN entry', async () => {
      jest.spyOn(ServiceManagerPupilDataService, 'findPupilByUpn').mockImplementation()
      await ServiceManagerPupilService.findPupilByUpn(validUpn.toLowerCase())
      expect(ServiceManagerPupilDataService.findPupilByUpn).toHaveBeenCalledWith(validUpn.toUpperCase())
    })

    test.todo('maps raw data result correctly into search result')
  })
})
