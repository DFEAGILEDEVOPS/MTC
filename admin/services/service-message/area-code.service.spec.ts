import { ServiceMessageAreaCodeService } from './area-code.service'
import { ServiceMessageAreaCodeDataService } from './area-code.data.service'

describe('ServiceMessageAreaCodeService class', () => {
  describe('getAreaCodes', () => {
    test('it sorts the area codes alphabetically ascending', async () => {
      jest.spyOn(ServiceMessageAreaCodeDataService, 'sqlGetAreaCodes').mockResolvedValue([
        { code: 'Z', description: 'Z test' },
        { code: 'A', description: 'A test' }
      ])
      const result = await ServiceMessageAreaCodeService.getAreaCodes()
      expect(result[0].code).toBe('A')
      expect(result[0].description).toBe('A test')
      expect(result[1].code).toBe('Z')
      expect(result[1].description).toBe('Z test')
    })

    test('when the table is empty', async () => {
      jest.spyOn(ServiceMessageAreaCodeDataService, 'sqlGetAreaCodes').mockResolvedValue([])
      const result = await ServiceMessageAreaCodeService.getAreaCodes()
      expect(result).toStrictEqual([])
    })
  })
})
