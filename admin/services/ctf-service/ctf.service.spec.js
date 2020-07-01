'use strict'
/* global describe expect it fail spyOn beforeAll */
const moment = require('moment')
const xmlbuilder2 = require('xmlBuilder2')

const sut = require('./ctf.service')
const ctfDataService = require('./data-access/ctf.data.service')
const checkWindowV2Service = require('../check-window-v2.service')
const resultsPageAvailabilityService = require('../results-page-availability.service')
const NotAvailableError = require('../../error-types/not-available')
const resultsStrings = require('../../lib/consts/mtc-results')

describe('ctfService', () => {
  const mockCheckWindow = {
    id: 1,
    checkEndDate: moment()
  }

  it('is defined', () => {
    expect(sut).toBeDefined()
  })

  it('has a method to download the xml results to send to the pupil as a file', () => {
    expect(sut.getSchoolResultDataAsXmlString).toBeDefined()
  })

  it('throws an error if the hdf has not been signed', async () => {
    spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(mockCheckWindow)
    spyOn(ctfDataService, 'isHdfSigned').and.returnValue(false)
    try {
      await sut.getSchoolResultDataAsXmlString(1, 'Europe/London')
      fail('Expected to throw')
    } catch (error) {
      expect(error.message).toMatch(/the HDF has not been signed/i)
      expect(error instanceof NotAvailableError).toBe(true)
    }
  })

  it('throws an error if the results are not yet available to view', async () => {
    spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(mockCheckWindow)
    spyOn(ctfDataService, 'isHdfSigned').and.returnValue(true)
    spyOn(resultsPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(false)
    try {
      await sut.getSchoolResultDataAsXmlString(1, 'Europe/London')
      fail('Expected to throw')
    } catch (error) {
      expect(error.message).toMatch(/the Results page is not yet available/i)
      expect(error instanceof NotAvailableError).toBe(true)
    }
  })

  describe('getCtfResult', () => {
    it('returns the score if they have taken the check', () => {
      const mockCtfResult = {
        score: 25,
        attendanceCode: null,
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe(25)
    })

    it('returns "A" if our system has marked them as not attending because of absence', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'ABSNT',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('A')
    })

    it('returns "B" if our system has marked them as not attending because they are working below expectation', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'BLSTD',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('B')
    })

    it('returns "J" if our system has marked them as not attending because they have just arrived', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'JSTAR',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('J')
    })

    it('returns "L" if our system has marked them as not attending because they have left the school', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'LEFTT',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('L')
    })

    it('returns "U" if our system has marked them as not attending because they are unable to access the check', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'NOACC',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('U')
    })

    it('returns "Z" if our system has marked them as not attending because they are incorrectly registered', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: 'INCRG',
        status: ''
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('Z')
    })

    it('returns "X" if our system has them attending but they have not had a pin generated', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: resultsStrings.didNotParticipate
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    it('returns "X" if our system has them attending and they had a PIN generated but did not take the check', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: resultsStrings.incomplete
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    it('returns "X" if our system has them attending and they did not take the restart', () => {
      const mockCtfResult = {
        score: null,
        attendanceCode: null,
        status: resultsStrings.restartNotTaken
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })
  })

  describe('buildXmlString', () => {
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
      { foreName: 'Albert', middleNames: 'Bertie', lastName: 'Rooster', group_id: null, dateOfBirth: moment('2010-11-20T00:00:00'), mark: 25, status: '', ctfResult: 25, upn: 'R674123101121', gender: 'M' }
    ]
    const academicYear = 2019
    let xml, obj

    beforeAll(() => {
      xml = sut.buildXmlString(mockSchool, mockPupilData, academicYear)
      obj = xmlbuilder2.convert(xml, { format: 'object' })
    })

    it('is defined', () => {
      expect(sut.buildXmlString).toBeDefined()
    })

    it('returns valid xml', () => {
      expect(typeof obj === 'object')
    })

    it('has a first element called `CTfile`', () => {
      expect(obj).toHaveProperty('CTfile')
    })

    it('the CTfile element children are present', () => {
      expect(obj.CTfile).toHaveProperty('Header')
      expect(obj.CTfile).toHaveProperty('CTFpupilData')
    })

    it('the Header element has a DocumentName', () => {
      expect(obj.CTfile.Header).toHaveProperty('DocumentName')
      expect(obj.CTfile.Header.DocumentName).toEqual('Common Transfer File')
    })

    it('the Header element has a CTFversion', () => {
      expect(obj.CTfile.Header).toHaveProperty('CTFversion')
      expect(obj.CTfile.Header.CTFversion).toEqual('19.0')
    })

    it('the Header element has a DateTime', () => {
      expect(obj.CTfile.Header).toHaveProperty('DateTime')
      const date = moment(obj.CTfile.Header.DateTime)
      expect(date.isValid()).toBe(true)
      // The date should have been generated less than 5000 milliseconds ago
      expect(Date.now() - date.valueOf()).toBeLessThanOrEqual(5000)
    })

    it('the Header element has a DocumentQualifier', () => {
      expect(obj.CTfile.Header).toHaveProperty('DocumentQualifier')
      expect(obj.CTfile.Header.DocumentQualifier).toEqual('partial')
    })

    it('the Header element has a SupplierID', () => {
      expect(obj.CTfile.Header).toHaveProperty('SupplierID')
      expect(obj.CTfile.Header.SupplierID).toEqual('Multiplication Tables Check')
    })

    it('the Header element has a SourceSchool', () => {
      expect(obj.CTfile.Header).toHaveProperty('SourceSchool')
    })

    it('the SourceSchool element has a LEA', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('LEA')
      expect(obj.CTfile.Header.SourceSchool.LEA).toEqual(mockSchool.leaCode.toString())
    })

    it('the SourceSchool element has a Estab', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('Estab')
      expect(obj.CTfile.Header.SourceSchool.Estab).toEqual(mockSchool.estabCode.toString())
    })

    it('the SourceSchool element has a URN', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('URN')
      expect(obj.CTfile.Header.SourceSchool.URN).toEqual(mockSchool.urn.toString())
    })

    it('the SourceSchool element has a SchoolName', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('SchoolName')
      expect(obj.CTfile.Header.SourceSchool.SchoolName).toEqual(mockSchool.name.toString())
    })

    it('the SourceSchool element has a AcademicYear', () => {
      expect(obj.CTfile.Header.SourceSchool).toHaveProperty('AcademicYear')
      expect(obj.CTfile.Header.SourceSchool.AcademicYear).toEqual(academicYear.toString())
    })

    it('the Header element has a DestSchool', () => {
      expect(obj.CTfile.Header).toHaveProperty('DestSchool')
    })

    it('the DestSchool element has an LEA', () => {
      expect(obj.CTfile.Header.DestSchool).toHaveProperty('LEA')
      expect(obj.CTfile.Header.DestSchool.LEA).toEqual(mockSchool.leaCode.toString())
    })

    it('the DestSchool element has an Estab', () => {
      expect(obj.CTfile.Header.DestSchool).toHaveProperty('Estab')
      expect(obj.CTfile.Header.DestSchool.Estab).toEqual(mockSchool.estabCode.toString())
    })

    it('the DestSchool element has an URN', () => {
      expect(obj.CTfile.Header.DestSchool).toHaveProperty('URN')
      expect(obj.CTfile.Header.DestSchool.URN).toEqual(mockSchool.urn.toString())
    })

    it('the CTFpupilData element has a pupil element', () => {
      expect(obj.CTfile.CTFpupilData).toHaveProperty('Pupil')
    })

    it('the Pupil element has a UPN', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('UPN')
      expect(obj.CTfile.CTFpupilData.Pupil.UPN).toEqual(mockPupilData[0].upn)
    })

    it('the Pupil element has a Surname', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('Surname')
      expect(obj.CTfile.CTFpupilData.Pupil.Surname).toEqual(mockPupilData[0].lastName.toUpperCase())
    })

    it('the Pupil element has a Forename', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('Forename')
      expect(obj.CTfile.CTFpupilData.Pupil.Forename).toEqual(mockPupilData[0].foreName.toUpperCase())
    })

    it('the Pupil element has a DOB', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('DOB')
      expect(obj.CTfile.CTFpupilData.Pupil.DOB).toEqual(mockPupilData[0].dateOfBirth.format('YYYY-MM-DD'))
    })

    it('the Pupil element has a Gender', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('Gender')
      expect(obj.CTfile.CTFpupilData.Pupil.Gender).toEqual(mockPupilData[0].gender)
    })

    it('the Pupil element has a StageAssessments element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil).toHaveProperty('StageAssessments')
    })

    it('the StageAssessments element has a KeyStage element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments).toHaveProperty('KeyStage')
    })

    it('the KeyStage element has a Stage element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('Stage')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.Stage).toEqual('KS2')
    })

    it('the KeyStage element has child elements', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('StageAssessment')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('Stage')
    })

    it('the KeyStage element has a StageAssessment element', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage).toHaveProperty('StageAssessment')
    })

    it('the StageAssessment element has a Locale', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Locale')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Locale).toEqual('ENG')
    })

    it('the StageAssessment element has a Year', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Year')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Year).toEqual((academicYear + 1).toString())
    })

    it('the StageAssessment element has a Subject', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Subject')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Subject).toEqual('MAT')
    })

    it('the StageAssessment element has a Method', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Method')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Method).toEqual('TT')
    })

    it('the StageAssessment element has a Component', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Component')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Component).toEqual('MTC')
    })

    it('the StageAssessment element has a ResultStatus', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('ResultStatus')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.ResultStatus).toEqual('R')
    })

    it('the StageAssessment element has a ResultQualifier', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('ResultQualifier')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.ResultQualifier).toEqual('MT')
    })

    it('the StageAssessment element has a Result', () => {
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment).toHaveProperty('Result')
      expect(obj.CTfile.CTFpupilData.Pupil.StageAssessments.KeyStage.StageAssessment.Result).toEqual(mockPupilData[0].ctfResult.toString())
    })
  })
})
