/* global describe, expect, it */

const accessArrangementsDescriptionsPresenter = require('../../../helpers/access-arrangements-descriptions-presenter')

describe('accessArrangementsDescriptionsPresenter', () => {
  describe('getPresentationData', () => {
    it('returns alphabetically sorted access arrangements descriptions data by description', () => {
      const attendanceCodes = [
        {
          id: 1,
          description: 'Audible time alert',
          code: 'ATA'
        },
        {
          id: 2,
          description: 'Colour contrast',
          code: 'CCT'
        },
        {
          id: 3,
          description: 'Font size',
          code: 'FTS'
        },
        {
          id: 4,
          description: 'Input assistance (reason and input assistant\'s name required)',
          code: 'ITA'
        },
        {
          id: 5,
          description: 'Pause - \'next\' button between questions',
          code: 'NBQ'
        },
        {
          id: 6,
          description: 'Audio version (reason required)',
          code: 'QNR'
        },
        {
          id: 7,
          description: 'Remove on-screen number pad',
          code: 'RON'
        }
      ]
      const attendanceCodesPresentationData = accessArrangementsDescriptionsPresenter.getPresentationData(attendanceCodes)
      expect(attendanceCodesPresentationData[0]).toEqual(
        {
          id: 1,
          description: 'Audible time alert',
          code: 'ATA'
        }
      )
      expect(attendanceCodesPresentationData[1]).toEqual(
        {
          id: 6,
          description: 'Audio version (reason required)',
          code: 'QNR'
        }
      )
      expect(attendanceCodesPresentationData[2]).toEqual(
        {
          id: 2,
          description: 'Colour contrast',
          code: 'CCT'
        }
      )
      expect(attendanceCodesPresentationData[3]).toEqual(
        {
          id: 3,
          description: 'Font size',
          code: 'FTS'
        }
      )
      expect(attendanceCodesPresentationData[4]).toEqual(
        {
          id: 4,
          description: 'Input assistance (reason and input assistant\'s name required)',
          code: 'ITA'
        }
      )
      expect(attendanceCodesPresentationData[5]).toEqual(
        {
          id: 5,
          description: 'Pause - \'next\' button between questions',
          code: 'NBQ'
        }
      )
      expect(attendanceCodesPresentationData[6]).toEqual(
        {
          id: 7,
          description: 'Remove on-screen number pad',
          code: 'RON'
        }
      )
    })
  })
})
