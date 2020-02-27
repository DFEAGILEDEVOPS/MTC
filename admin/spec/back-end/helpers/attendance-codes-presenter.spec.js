/* global describe, expect, it */

const attendanceCodesPresenter = require('../../../helpers/attendance-codes-presenter')

describe('attendanceCodesPresenter', () => {
  describe('getPresentationData', () => {
    it('returns alphabetically sorted attendance codes data by reason', () => {
      const attendanceCodes = [
        {
          id: 1,
          reason: 'Absent during check window',
          code: 'ABSNT'
        },
        {
          id: 2,
          reason: 'Left school',
          code: 'LEFTT'
        },
        {
          id: 3,
          reason: 'Incorrect registration',
          code: 'INCRG'
        },
        {
          id: 5,
          reason: 'Unable to access',
          code: 'NOACC'
        },
        {
          id: 6,
          reason: 'Working below expectation',
          code: 'BLSTD'
        },
        {
          id: 7,
          reason: 'Just arrived and unable to establish abilities',
          code: 'JSTAR'
        }
      ]
      const attendanceCodesPresentationData = attendanceCodesPresenter.getPresentationData(attendanceCodes)
      expect(attendanceCodesPresentationData[0]).toEqual(
        {
          id: 1,
          reason: 'Absent during check window',
          code: 'ABSNT'
        }
      )
      expect(attendanceCodesPresentationData[1]).toEqual(
        {
          id: 3,
          reason: 'Incorrect registration',
          code: 'INCRG'
        }
      )
      expect(attendanceCodesPresentationData[2]).toEqual(
        {
          id: 7,
          reason: 'Just arrived and unable to establish abilities',
          code: 'JSTAR'
        }
      )
      expect(attendanceCodesPresentationData[3]).toEqual(
        {
          id: 2,
          reason: 'Left school',
          code: 'LEFTT'
        }
      )
      expect(attendanceCodesPresentationData[4]).toEqual(
        {
          id: 5,
          reason: 'Unable to access',
          code: 'NOACC'
        }
      )
      expect(attendanceCodesPresentationData[5]).toEqual(
        {
          id: 6,
          reason: 'Working below expectation',
          code: 'BLSTD'
        }
      )
    })
  })
})
