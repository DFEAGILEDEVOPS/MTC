'use strict'
/* global describe, it, expect */

const qrService = require('../../services/qr.service')
const qrURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEU' +
  'gAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAN2SURBVO3B' +
  'QY5jBxYDweSD7n/lHC+84OoDglTlHpsR8S/M/O2YKcdMOWbKMVOOmXL' +
  'MlGOmHDPlmCnHTDlmyjFTjplyzJRjprz4UBJ+k8qTJLxD5UkS3qHSkv' +
  'CbVD5xzJRjphwz5cWXqXxTEp4k4YlKS8KTJDxRaUl4h8o3JeGbjplyz' +
  'JRjprz4YUl4h8onVFoSniThiUpLwjcl4R0qP+mYKcdMOWbKi/8YlZaE' +
  'pvJfdsyUY6YcM+XF/zmVloSfpNKS8G9yzJRjphwz5cUPU/knqbQkNJV' +
  '/ksqf5Jgpx0w5ZsqLL0vCb0pCU2lJaCotCU2lJaGpfCIJf7Jjphwz5Z' +
  'gpLz6k8l+ShHeo/D85ZsoxU46Z8uJDSWgq35SEpvIkCU2lJeEdKu9Iw' +
  'hOVJ0l4h8o3HTPlmCnHTIl/4QNJeIdKS0JTeZKEJyotCZ9QaUloKu9I' +
  'wjepfNMxU46ZcsyUF1+m8iQJ70hCU3mShCcqT5LQkvAkCU9UPqHSktC' +
  'S0FQ+ccyUY6YcM+XFh1S+KQlNpSWhqTSVloRPqLQkNJWWhJ+k0pLwTc' +
  'dMOWbKMVNefCgJn1B5koSm0pLwiSR8IglNpSXhicqf5Jgpx0w5ZsqLL' +
  '1N5koSWhKbSVFoSmsqTJDxR+UkqLQmfSEJT+aZjphwz5ZgpL35YEprK' +
  'O5LQVFoSmkpTaUl4ovIOlZaEdyThicqTJDSVTxwz5Zgpx0x58Q9LwhO' +
  'VloR3JOGJyk9SaUl4otKS0FRaEr7pmCnHTDlmSvwLH0hCU3mShKbSkv' +
  'BEpSWhqTxJQlP5RBJ+k8pPOmbKMVOOmfLiQyrvUHmi8pNUWhLeofJE5' +
  'R1J+JMcM+WYKcdMefGhJPwmlabSktBUWhKayk9KQlN5ovKOJDSVTxwz' +
  '5Zgpx0x58WUq35SEd6g8UWlJeKLyCZVvSsJPOmbKMVOOmfLihyXhHSr' +
  'flISm8kSlJeEdSfhEEp6otCR80zFTjplyzJQX/zJJaCpPVH6TypMkNJ' +
  'WWhJ90zJRjphwz5cW/XBLeodJUvikJTaWptCQ0lZaEbzpmyjFTjpny4' +
  'oep/MlUniShqbQkPFFpKi0JTaWp/KZjphwz5ZgpL74sCb8pCU3lE0n4' +
  'piQ8UfmTHDPlmCnHTIl/YeZvx0w5ZsoxU46ZcsyUY6YcM+WYKcdMOWb' +
  'KMVOOmXLMlGOmHDPlf6gcfBrGIkCUAAAAAElFTkSuQmCC'

describe('qr.service', () => {
  describe('getDataURL', () => {
    it('returns a data url when config url parameter is defined', async () => {
      const dataURL = await qrService.getDataURL('http//:google.com')
      expect(dataURL).toBe(qrURL)
    })
    it('returns null when url parameter is not defined', async () => {
      const dataURL = await qrService.getDataURL('')
      expect(dataURL).toBeNull()
    })
  })
})
