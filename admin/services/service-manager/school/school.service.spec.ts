import { ServiceManagerSchoolService } from './school.service'
import { ServiceManagerSchoolDataService } from './school.data.service'
const sut = ServiceManagerSchoolService

describe('ServiceManagerSchoolService', () => {
  describe('findSchoolByUrn', () => {
    test('the functions exists', () => {
      expect(sut.findSchoolByUrn).toBeDefined()
    })

    test('it throws an error if the URN is not provided', async () => {
      // @ts-ignore: passing undef instead of number
      await expect(sut.findSchoolByUrn()).rejects.toThrow('URN not provided')
    })

    test('it calls the data service', async () => {
      jest.spyOn(ServiceManagerSchoolDataService, 'sqlFindSchoolByUrn').mockResolvedValue({})
      await sut.findSchoolByUrn(123)
      expect(ServiceManagerSchoolDataService.sqlFindSchoolByUrn).toHaveBeenCalledWith(123)
    })
  })

  describe('findSchoolBySlug', () => {
    test('the functions exists', () => {
      expect(sut.findSchoolBySlug).toBeDefined()
    })

    test('it throws an error if the Slug is not provided', async () => {
      await expect(sut.findSchoolBySlug('')).rejects.toThrow('School URL slug not provided')
    })

    test('it calls the data service', async () => {
      jest.spyOn(ServiceManagerSchoolDataService, 'sqlFindSchoolBySlug').mockResolvedValue({})
      await sut.findSchoolBySlug('slug')
      expect(ServiceManagerSchoolDataService.sqlFindSchoolBySlug).toHaveBeenCalledWith('slug')
    })
  })
})
