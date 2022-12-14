'use strict'
/* global describe test expect jest */

const qrService = require('../../../services/qr.service')
const redisKeyService = require('../../../services/redis-key.service')
const redisService = require('../../../services/data-access/redis-cache.service')

const googleUrlQrCodeData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOn' +
'AAAAAklEQVR4AewaftIAAAOOSURBVO3BQY5biRUEwcwH3v/KZS0GcK0+QJCtkeyKML8w849jphwz5Z' +
'gpx0w5ZsoxU46ZcsyUY6YcM+WYKcdMOWbKMVOOmfLiQyq/UxKaSktCU3mShKbyiSQ0ld8pCZ84Zsox' +
'U46Z8uLLkvBNKk+S8I4kNJUnSfimJHyTyjcdM+WYKcdMefHDVN6RhN8pCU9UniThEyrvSMJPOmbKMV' +
'OOmfLiL6fyJAnvUGlJeKLSkvA3O2bKMVOOmfLif0wSmsqTJLQkNJX/J8dMOWbKMVNe/LAk/E4qLQlN' +
'5R1JeKLyiST8SY6ZcsyUY6a8+DKVf1MSmkpLQlNpSWgqLQmfUPmTHTPlmCnHTDG/8BdTaUl4otKSMP' +
'91zJRjphwzxfzCB1RaEt6h0pLQVD6RhN9J5ZuS8ESlJeETx0w5ZsoxU158KAlN5R1JaCotCe9QeaLS' +
'ktBUvikJT1TeodKS8E3HTDlmyjFTXnxI5RMqLQlN5UkSPqHyJAlNpSXhHSrvUGlJ+EnHTDlmyjFTXn' +
'xZEppKS8ITlZaEptJUWhKaSktCU2lJaCotCe9QeZKEJypNpSXhm46ZcsyUY6a8+JepPFF5koSm8kSl' +
'JeFJEppKS0JTeZKEJyrvUGlJ+MQxU46ZcswU8wsfUGlJ+IRKS0JTeUcSnqi0JDSVTyThiUpLwhOVlo' +
'RvOmbKMVOOmWJ+4QepPElCU3mShKbyJAlN5ZuS8A6VTyThJx0z5Zgpx0x58YdLwk9KwhOVloR3qLwj' +
'CU2lqbQkfNMxU46ZcswU8wsfUPmmJDSVJ0loKi0JT1RaEprKnyQJP+mYKcdMOWaK+YW/mEpLQlNpSX' +
'iHSktCU2lJeIdKS8K/6Zgpx0w5ZsqLD6n8Tkl4RxLeofJNKi0Jf7Jjphwz5ZgpL74sCd+k8iQJTeVJ' +
'EppKS8I3JeEdKu9IwjcdM+WYKcdMefHDVN6RhHeoPElCU/lJKj8pCT/pmCnHTDlmyou/XBKaSlNpSW' +
'gqTaUloak8SUJTeZKEJypN5UkSPnHMlGOmHDPlxf+YJDSVpvIkCU2lJaGpNJUnSXii0pLQVFoSvumY' +
'KcdMOWbKix+WhH9TEr5JpSXhiUpTeYfK73TMlGOmHDPlxZep/E4qT5LQVJ4koSWhqbwjCZ9QeaLSkv' +
'CJY6YcM+WYKeYXZv5xzJRjphwz5Zgpx0w5ZsoxU46ZcsyUY6YcM+WYKcdMOWbKMVP+A5JsiSX0M+5q' +
'AAAAAElFTkSuQmCC'

describe('qr.service', () => {
  describe('getDataURL', () => {

    beforeEach(() => {
      jest.restoreAllMocks()
    })
    test('returns a qr encoded data image', async () => {
      const googleUrl = 'https://www.google.co.uk'
      jest.spyOn(redisService, 'get').mockResolvedValue(undefined)
      jest.spyOn(redisService, 'set').mockResolvedValue()
      const dataUrl = await qrService.getDataURL(googleUrl)
      expect(dataUrl).toBe(googleUrlQrCodeData)
      const googleUrlCacheKey = redisKeyService.getQrCodeUrlPrefix(googleUrl)
      expect(redisService.get).toHaveBeenCalledWith(googleUrlCacheKey)
      expect(redisService.set).toHaveBeenCalledWith(googleUrlCacheKey, dataUrl)
    })
    test('returns null when url parameter is not defined', async () => {
      const dataUrl = await qrService.getDataURL('')
      expect(dataUrl).toBeNull()
    })

    test('qr code data is returned from the cache if it exists', async () => {
      const cachedQrCode = 'foo'
      jest.spyOn(redisService, 'get').mockResolvedValue(cachedQrCode)
      jest.spyOn(redisService, 'set').mockResolvedValue()
      jest.spyOn(redisKeyService, 'getQrCodeUrlPrefix')
      const qrCode = await qrService.getDataURL('url')
      expect(redisService.get).toHaveBeenCalled()
      expect(redisKeyService.getQrCodeUrlPrefix).toHaveBeenCalledTimes(1)
      expect(qrCode).toEqual(cachedQrCode)
      expect(redisService.set).not.toHaveBeenCalled()
    })
  })
})
