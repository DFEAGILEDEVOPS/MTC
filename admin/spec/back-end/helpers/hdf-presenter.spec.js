/* global describe, expect, it */

const hdfPresenter = require('../../../helpers/hdf-presenter')

describe('hdfPresenter', () => {
  describe('getPupilsWithProcessStatus', () => {
    it('returns pupils with process status of either incomplete complete or empty', () => {
      const pupils = [
        {
          id: 1,
          pupilStatusCode: 'STARTED',
          checkStatusCode: 'NTR'
        },
        {
          id: 2,
          pupilStatusCode: 'NOT_TAKING',
          checkStatusCode: ''
        },
        {
          id: 3,
          pupilStatusCode: 'COMPLETED',
          checkStatusCode: 'CMP'
        },
        {
          id: 4,
          pupilStatusCode: '',
          checkStatusCode: ''
        }
      ]
      const results = hdfPresenter.getPupilsWithProcessStatus(pupils)
      expect(results[0].status).toEqual('Incomplete')
      expect(results[1].status).toEqual('Not taking the Check')
      expect(results[2].status).toEqual('Complete')
      expect(results[3].status).toEqual('')
    })
  })
})
