import { ServiceManagerPupilService } from './service-manager.pupil.service'
import { ServiceManagerPupilDataService } from './service-manager.pupil.data.service'

let sut: ServiceManagerPupilService
let dataService: ServiceManagerPupilDataService
const validUpn = 'ThirteenChar5'

describe('service manager pupil service', () => {
  beforeEach(() => {
    dataService = new ServiceManagerPupilDataService()
    sut = ServiceManagerPupilService.createInstance(dataService)
  })
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('findPupilByUpn', () => {
    test('error is thrown if upn is undefined', async () => {
      await expect(sut.findPupilByUpn(undefined)).rejects.toThrow('upn is required')
    })
    test('error is thrown if upn is empty string', async () => {
      await expect(sut.findPupilByUpn('')).rejects.toThrow('upn is required')
    })
    test('error is thrown if upn is not 13 chars in length', async () => {
      await expect(sut.findPupilByUpn('twelvecharss')).rejects.toThrow('upn should be 13 characters and numbers')
    })
    test('error is thrown if upn contains non alphanumeric characters', async () => {
      await expect(sut.findPupilByUpn('this-is-badd&')).rejects.toThrow('upn should only contain alphanumeric characters')
    })
    test('passes validation if no issues with input', async () => {
      jest.spyOn(dataService, 'findPupilByUpn').mockImplementation()
      await sut.findPupilByUpn(validUpn)
      expect(dataService.findPupilByUpn).toHaveBeenCalledTimes(1)
    })
    test.todo('force uppercase after entry')
    test.todo('maps raw data result correctly into search result')
  })
})
