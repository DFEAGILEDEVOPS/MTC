import { ServiceManagerPupilService } from './service-manager.pupil.service'

let sut: ServiceManagerPupilService

describe('service manager pupil service', () => {
  beforeEach(() => {
    sut = ServiceManagerPupilService.createInstance()
  })
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('findPupilByUpn', () => {

  })
})

describe('basic upn validator', () => {

})
