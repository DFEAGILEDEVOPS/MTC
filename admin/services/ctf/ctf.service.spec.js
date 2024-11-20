'use strict'
const moment = require('moment')
const xmlbuilder2 = require('xmlbuilder2')

const sut = require('./ctf.service')
const ctfDataService = require('./data-access/ctf.data.service')
const checkWindowV2Service = require('../check-window-v2.service')
const resultsPageAvailabilityService = require('../results-page-availability.service')
const NotAvailableError = require('../../error-types/not-available')
const resultsStrings = require('../../lib/consts/mtc-results')

describe('ctfService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockCheckWindow = {
    id: 1,
    checkEndDate: moment()
  }

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it has a method to download the xml results to send to the pupil as a file', () => {
    expect(sut.getSchoolResultDataAsXmlString).toBeDefined()
  })

  test('throws an error if the hdf has not been signed', async () => {
    jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
    jest.spyOn(ctfDataService, 'isHdfSigned').mockResolvedValue(false)
    await expect(sut.getSchoolResultDataAsXmlString(1, 'Europe/London')).rejects.toThrow(
      new NotAvailableError('Unable to download CTF file as the HDF has not been signed')
    )
  })

  test('throws an error if the results are not yet available to view', async () => {
    jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(mockCheckWindow)
    jest.spyOn(ctfDataService, 'isHdfSigned').mockResolvedValue(true)
    jest.spyOn(resultsPageAvailabilityService, 'isResultsFeatureAccessible').mockReturnValue(false)
    await expect(sut.getSchoolResultDataAsXmlString(1, 'Europe/London')).rejects.toThrow(
      new NotAvailableError('The Results page is not yet available')
    )
  })

  describe('getCtfResult', () => {
    test('returns the score if they have taken the check', () => {
      const mockCtfResult = {
        score: 25,
        attendanceCode: null,
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe(25)
    })

    test('returns "A" if our system has marked them as not attending because of absence', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'ABSNT',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('A')
    })

    test('returns "B" if our system has marked them as not attending because they are working below expectation', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'BLSTD',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('B')
    })

    test('returns "J" if our system has marked them as not attending because they have just arrived', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'JSTAR',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('J')
    })

    test('returns "L" if our system has marked them as not attending because they have left the school', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'LEFTT',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('L')
    })

    test('returns "U" if our system has marked them as not attending because they are unable to access the check', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'NOACC',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('U')
    })

    test('returns "Z" if our system has marked them as not attending because they are incorrectly registered', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'INCRG',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('Z')
    })

    test('returns "X" if our system has them attending but they have not had a pin generated', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: resultsStrings.didNotParticipate
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    test('returns "X" if our system has them attending and they had a PIN generated but did not take the check', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: resultsStrings.incomplete
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    test('returns "X" if our system has them attending and they did not take the restart', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: resultsStrings.restartNotTaken
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    test('returns "X" by default if we can\'t determine anything better', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    test('returns "NAA" if they are marked as not attending with a code of NOABA (Not able to take the check)', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'NOABA',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('NAA')
    })

    test('returns "H" if they were annulled with a pupil cheating code (ANLLH)', () => {
      const mockCtfResult = {
        score: 25,
        attendanceCode: 'ANLLH',
        status: 'Pupil cheating'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('H')
    })

    test('returns "Q" if they were annulled with a maladministration code (ANLLQ)', () => {
      const mockCtfResult = {
        score: 5,
        attendanceCode: 'ANLLQ',
        status: 'Maladministration'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('Q')
    })
  })

  describe('buildXmlString', () => {
    // We need to set a particular test date in order to know in advance what the ctfVersion will be, which is one of the tests.  However, we also want to ensure that
    // if a teacher downloads the results from June in the September, in the next academic year, that the version will reflect the previous academic year.
    const testDate = '2022-10-25T09:00:00 +01:00'
    jest.mock('moment', () => {
      return () => jest.requireActual('moment')(testDate)
    })
    const mockSchool = {
      id: 1,
      name: 'School of Mock',
      leaCode: 999,
      estabCode: '1001',
      dfeNumber: 9991001,
      urn: 90875
    }
    /* @var {foreName:string, middleNames:string, lastName:string, group_id:null|number, dateOfBirth: Moment.moment, mark:null|number, status:string, ctfResult:number|string} */
    const mockPupilData = [
      { foreName: 'Albert', middleNames: 'Bertie', lastName: 'Rooster', group_id: null, dateOfBirth: moment('2010-11-20T00:00:00'), originalDateOfBirth: moment('2010-11-20T00:00:00'), mark: 25, status: '', ctfResult: 25, upn: 'R674123101121', gender: 'M' }
    ]
    const academicYear = 2019
    const stageAssessmentYear = 2020
    let xml, obj

    beforeAll(() => {
      xml = sut.buildXmlString(mockSchool, mockPupilData, academicYear, stageAssessmentYear)
      obj = xmlbuilder2.convert(xml, { format: 'object' })
    })

    test('is defined', () => {
      expect(sut.buildXmlString).toBeDefined()
    })

    test('returns valid xml', () => {
      expect(typeof obj === 'object').toBe(true)
    })

    test('has a first element called `CTfile`', () => {
      expect(obj).toHaveProperty('CTfile')
    })

    test('the CTfile element children are present', () => {
      expect(obj.CTfile).toHaveProperty('Header')
      expect(obj.CTfile).toHaveProperty('CTFpupilData')
    })

    test('the Header element has a DocumentName', () => {
      expect(obj.CTfile.Header).toHaveProperty('DocumentName')
      expect(obj.CTfile.Header.DocumentName).toEqual('Common Transfer File')
    })

    test('the Header element has a CTFversion', () => {
      expect(obj.CTfile.Header).toHaveProperty('CTFversion')
      expect(obj.CTfile.Header.CTFversion).toEqual('19.0') // academic year set above
    })

    test('the Header element has a DateTime', () => {
      expect(obj.CTfile.Header).toHaveProperty('DateTime')
      const date = moment(obj.CTfile.Header.DateTime)
      expect(date.isValid()).toBe(true)
      // The date should have been generated less than 5000 milliseconds ago
      expect(Date.now() - date.valueOf()).toBeLessThanOrEqual(5000)
    })

    test('the Header element has a DocumentQualifier', () => {
      expect(obj.CTfile.Header).toHaveProperty('DocumentQualifier')
      expect(obj.CTfile.Header.DocumentQualifier).toEqual('partial')
    })

    test('the Header element has a SupplierID', () => {
      expect(obj.CTfile.Header).toHaveProperty('SupplierID')
      expect(obj.CTfile.Header.SupplierID).toEqual('Multiplication Tables Check')
    })

    test('the Header element has a SourceSchool', () => {
      expect(obj.CTfile.Header).toHaveProperty('SourceSchool')
    })

    test('the SourceSchool element has a LEA', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('LEA')
      expect(obj.CTfile.Header.SourceSchool.LEA).toEqual(mockSchool.leaCode.toString())
    })

    test('the SourceSchool element has a Estab', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('Estab')
      expect(obj.CTfile.Header.SourceSchool.Estab).toEqual(mockSchool.estabCode.toString())
    })

    test('the SourceSchool element has a URN', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('URN')
      expect(obj.CTfile.Header.SourceSchool.URN).toEqual(mockSchool.urn.toString())
    })

    test('the SourceSchool element has a SchoolName', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('SchoolName')
      expect(obj.CTfile.Header.SourceSchool.SchoolName).toEqual(mockSchool.name.toString())
    })

    test('the SourceSchool element has a AcademicYear', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('AcademicYear')
      expect(obj.CTfile.Header.SourceSchool.AcademicYear).toEqual(academicYear.toString())
    })

    test('the Header element has a DestSchool', () => {
      expect(obj.CTfile.Header).toHaveProperty('DestSchool')
    })

    test('the DestSchool element has an LEA', () => {
      expect(obj.CTfile.Header.DestSchool).toHaveProperty('LEA')
      expect(obj.CTfile.Header.DestSchool.LEA).toEqual(mockSchool.leaCode.toString())
    })

    test('the DestSchool element has an Estab', () => {
      expect(obj.CTfile.Header.DestSchool).toHaveProperty('Estab')
      expect(obj.CTfile.Header.DestSchool.Estab).toEqual(mockSchool.estabCode.toString())
    })

    test('the DestSchool element has an URN', () => {
      expect(obj.CTfile.Header.DestSchool).toHaveProperty('URN')
      expect(obj.CTfile.Header.DestSchool.URN).toEqual(mockSchool.urn.toString())
    })

    test('the CTFpupilData element has a pupil element', () => {
      expect(obj.CTfile.CTFpupilData).toHaveProperty('Pupil')
    })

    test('the Pupil element has a UPN', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('UPN')
      expect(obj.CTfile.CTFpupilData.Pupil.UPN).toEqual(mockPupilData[0].upn)
    })

    test('the Pupil element has a Surname', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('Surname')
      expect(obj.CTfile.CTFpupilData.Pupil.Surname).toEqual(mockPupilData[0].lastName.toUpperCase())
    })

    test('the Pupil element has a Forename', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('Forename')
      expect(obj.CTfile.CTFpupilData.Pupil.Forename).toEqual(mockPupilData[0].foreName.toUpperCase())
    })

    test('the Pupil element has a DOB', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('DOB')
      expect(obj.CTfile.CTFpupilData.Pupil.DOB).toEqual(mockPupilData[0].dateOfBirth.format('YYYY-MM-DD'))
    })

    test('the Pupil element has a Gender', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('Sex')
      expect(obj.CTfile.CTFpupilData.Pupil.Sex).toEqual(mockPupilData[0].gender)
    })

    test('the Pupil element has a StageAssessments element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('StageAssessments')
    })

    test('the StageAssessments element has a KeyStage element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments).toHaveProperty('KeyStage')
    })

    test('the KeyStage element has a Stage element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('Stage')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.Stage).toEqual('KS2')
    })

    test('the KeyStage element has child elements', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('StageAssessment')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('Stage')
    })

    test('the KeyStage element has a StageAssessment element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('StageAssessment')
    })

    test('the StageAssessment element has a Locale', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Locale')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Locale).toEqual('ENG')
    })

    test('the StageAssessment element has a Year', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Year')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Year).toEqual(stageAssessmentYear.toString())
    })

    test('the StageAssessment element has a Subject', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Subject')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Subject).toEqual('MAT')
    })

    test('the StageAssessment element has a Method', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Method')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Method).toEqual('TT')
    })

    test('the StageAssessment element has a Component', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Component')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Component).toEqual('MTC')
    })

    test('the StageAssessment element has a ResultStatus', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('ResultStatus')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.ResultStatus).toEqual('R')
    })

    test('the StageAssessment element has a ResultQualifier', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('ResultQualifier')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.ResultQualifier).toEqual('MT')
    })

    test('the StageAssessment element has a Result', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Result')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Result).toEqual(mockPupilData[0].ctfResult.toString())
    })
  })

  describe('getAcademicYear', () => {
    test('returns the current year if the month is September', () => {
      const d = moment('2010-09-01T09:00:00Z')
      const academicYear = sut.getAcademicYear(d)
      expect(academicYear).toStrictEqual(2010)
    })

    test('returns the current year if the month is later than September', () => {
      const d = moment('2010-10-01T09:00:00Z')
      const academicYear = sut.getAcademicYear(d)
      expect(academicYear).toStrictEqual(2010)
    })

    test('returns the previous year if the month is earlier than September', () => {
      const d = moment('2010-08-01T09:00:00Z')
      const academicYear = sut.getAcademicYear(d)
      expect(academicYear).toStrictEqual(2009)
    })

    test('returns the previous year if the month is January', () => {
      const d = moment('2010-01-01T09:00:00Z')
      const academicYear = sut.getAcademicYear(d)
      expect(academicYear).toStrictEqual(2009)
    })
  })

  describe('getCtfVersion', () => {
    test('the version returns is the last two digits of the current academic year, with .0 at the end, as a string', () => {
      expect(sut.getCtfVersion(2022)).toBe('22.0')
    })

    test('works when range at end of range', () => {
      expect(sut.getCtfVersion(1999)).toBe('99.0')
    })

    test('works when range at beginning of range', () => {
      expect(sut.getCtfVersion(2100)).toBe('00.0')
    })

    test('is a string', () => {
      expect(typeof sut.getCtfVersion(2022)).toBe('string')
    })
  })
})
