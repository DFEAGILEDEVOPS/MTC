'use strict'
/* global describe, it, expect spyOn beforeEach */

const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')

const pupilAccessArrangementsMock = [
  {
    'urlSlug': '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    'foreName': 'Ebony',
    'middleNames': '',
    'lastName': 'Daniels',
    'description': 'Audible time alert'
  },
  {
    'urlSlug': '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    'foreName': 'Ebony',
    'middleNames': '',
    'lastName': 'Daniels',
    'description': 'Colour contrast'
  },
  {
    'urlSlug': '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    'foreName': 'Ebony',
    'middleNames': '',
    'lastName': 'Daniels',
    'description': 'Remove on-screen number pad'
  },
  {
    'urlSlug': '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
    'foreName': 'Gregory',
    'middleNames': 'Green',
    'lastName': 'Duke',
    'description': 'Colour contrast'
  },
  {
    'urlSlug': '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
    'foreName': 'Gregory',
    'middleNames': 'Green',
    'lastName': 'Duke',
    'description': 'Font size'
  },
  {
    'urlSlug': '34356B98-BCD8-485F-9F2E-F4CBF2741FA7',
    'foreName': 'Sweeney',
    'middleNames': 'White',
    'lastName': 'Wolfe',
    'description': 'Question reader (reason required)'
  },
  {
    'urlSlug': '34356B98-BCD8-485F-9F2E-F4CBF2741FA7',
    'foreName': 'Sweeney',
    'middleNames': 'White',
    'lastName': 'Wolfe',
    'description': 'Remove on-screen number pad'
  }
]

describe('pupilAccessArrangementsService', () => {
  describe('getPupils', () => {
    describe('successfully processes and', () => {
      let pupils
      beforeEach(async () => {
        spyOn(pupilAccessArrangementsDataService, 'sqFindPupilsWithAccessArrangements').and.returnValue(pupilAccessArrangementsMock)
        pupils = await pupilAccessArrangementsService.getPupils(9991001)
      })
      it('returns a list of pupils with associated access arrangements', () => {
        expect(pupils.length).toBe(3)
        expect(pupils[1]).toEqual(
          {
            urlSlug: '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
            foreName: 'Gregory',
            middleNames: 'Green',
            lastName: 'Duke',
            arrangements: ['Colour contrast', 'Font size'],
            fullName: 'Duke, Gregory'
          }
        )
      })
      it('removes reason required phrase if exists on access arrangements description list', () => {
        expect(pupils[2].arrangements[0]).toBe('Question reader')
      })
      it('should not include description property', () => {
        expect(pupils[2].description).toBeUndefined()
      })
    })
  })
})
