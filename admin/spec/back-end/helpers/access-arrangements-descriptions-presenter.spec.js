/* global describe, expect, test */

const accessArrangementsDescriptionsPresenter = require('../../../helpers/access-arrangements-descriptions-presenter')

describe('accessArrangementsDescriptionsPresenter', () => {
  describe('getPresentationData', () => {
    test('returns alphabetically sorted access arrangements descriptions data by description', () => {
      const accessArrangements = [
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
          description: 'Input assistance',
          code: 'ITA'
        },
        {
          id: 5,
          description: 'Pause - \'next\' button between questions',
          code: 'NBQ'
        },
        {
          id: 6,
          description: 'Audio version',
          code: 'QNR'
        },
        {
          id: 7,
          description: 'Remove on-screen number pad',
          code: 'RON'
        }
      ]
      const accessArrangementsPresentationData = accessArrangementsDescriptionsPresenter.getPresentationData(accessArrangements)
      expect(accessArrangementsPresentationData[0]).toEqual(
        {
          id: 1,
          description: 'Audible time alert',
          code: 'ATA'
        }
      )
      expect(accessArrangementsPresentationData[1]).toEqual(
        {
          id: 6,
          description: 'Audio version',
          code: 'QNR'
        }
      )
      expect(accessArrangementsPresentationData[2]).toEqual(
        {
          id: 2,
          description: 'Colour contrast',
          code: 'CCT'
        }
      )
      expect(accessArrangementsPresentationData[3]).toEqual(
        {
          id: 3,
          description: 'Font size',
          code: 'FTS'
        }
      )
      expect(accessArrangementsPresentationData[4]).toEqual(
        {
          id: 4,
          description: 'Input assistance',
          code: 'ITA'
        }
      )
      expect(accessArrangementsPresentationData[5]).toEqual(
        {
          id: 5,
          description: 'Pause - \'next\' button between questions',
          code: 'NBQ'
        }
      )
      expect(accessArrangementsPresentationData[6]).toEqual(
        {
          id: 7,
          description: 'Remove on-screen number pad',
          code: 'RON'
        }
      )
    })
  })
  describe('addReasonRequiredIndication', () => {
    test('returns access arrangements descriptions data with reason required indications', () => {
      const accessArrangements = [
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
          description: 'Input assistance',
          code: 'ITA'
        },
        {
          id: 5,
          description: 'Pause - \'next\' button between questions',
          code: 'NBQ'
        },
        {
          id: 6,
          description: 'Audio version',
          code: 'QNR'
        },
        {
          id: 7,
          description: 'Remove on-screen number pad',
          code: 'RON'
        }
      ]
      const accessArrangementsPresentationData = accessArrangementsDescriptionsPresenter.addReasonRequiredIndication(accessArrangements)
      expect(accessArrangementsPresentationData[0]).toEqual(
        {
          id: 1,
          description: 'Audible time alert',
          code: 'ATA'
        }
      )
      expect(accessArrangementsPresentationData[1]).toEqual(
        {
          id: 2,
          description: 'Colour contrast',
          code: 'CCT'
        }
      )
      expect(accessArrangementsPresentationData[2]).toEqual(
        {
          id: 3,
          description: 'Font size',
          code: 'FTS'
        }
      )
      expect(accessArrangementsPresentationData[3]).toEqual(
        {
          id: 4,
          description: 'Input assistance (reason and input assistant\'s name required)',
          code: 'ITA'
        }
      )
      expect(accessArrangementsPresentationData[4]).toEqual(
        {
          id: 5,
          description: 'Pause - \'next\' button between questions',
          code: 'NBQ'
        }
      )
      expect(accessArrangementsPresentationData[5]).toEqual(
        {
          id: 6,
          description: 'Audio version (reason required)',
          code: 'QNR'
        }
      )
      expect(accessArrangementsPresentationData[6]).toEqual(
        {
          id: 7,
          description: 'Remove on-screen number pad',
          code: 'RON'
        }
      )
    })
  })
})
