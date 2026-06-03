import { TestBed } from '@angular/core/testing'
import { HttpErrorResponse } from '@angular/common/http'
import { UserService } from './user.service'
import { StorageService } from '../storage/storage.service'
import { default as mockLoginResponseBody } from '../../login.userService.response.mock.json'
import {
  ConfigStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey
} from '../storage/storageKey'
import { HttpService } from '../http/http.service'
import { APP_INITIALIZER } from '@angular/core'
import { APP_CONFIG, loadConfigMockService } from '../config/config.service'
import { Meta } from '@angular/platform-browser'
import { AuditServiceMock } from '../audit/audit.service.mock'
import { AuditService } from '../audit/audit.service'
import { AuditEntryFactory, LoginSuccessAuditEntryClass } from '../audit/auditEntry'

let userService: UserService
let storageService: StorageService
const questionsDataKey = new QuestionsStorageKey()
const pupilDataKey = new PupilStorageKey()
const configDataKey = new ConfigStorageKey()
const schoolDataKey = new SchoolStorageKey()

describe('UserService', () => {
  let httpServiceSpy: { postJson: jasmine.Spy }
  let storageServiceSpy: {
    clear: jasmine.Spy,
    setConfig: jasmine.Spy,
    setPupil: jasmine.Spy,
    setQuestions: jasmine.Spy,
    setSchool: jasmine.Spy,
    setToken: jasmine.Spy,
    getPupil: jasmine.Spy,
    getCompletedSubmission: jasmine.Spy
  }
  let metaServiceSpy: {
    getTag: jasmine.Spy
  }
  let auditService: AuditServiceMock

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['postJson'])
    storageServiceSpy = jasmine.createSpyObj('StorageService',
      ['clear', 'setQuestions', 'setConfig', 'setPupil', 'setSchool', 'setToken', 'getAccessArrangements',
        'getPupil', 'getCompletedSubmission']
    )
    metaServiceSpy = jasmine.createSpyObj('MetaService', ['getTag'])
    metaServiceSpy.getTag.and.returnValue('some-build-number')
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        UserService,
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: Meta, useValue: metaServiceSpy },
        { provide: AuditService, useClass: AuditServiceMock},
        { provide: AuditEntryFactory, useClass: AuditEntryFactory }
      ]
    })

    userService = TestBed.inject(UserService)
    storageService = TestBed.inject(StorageService)
    auditService = TestBed.inject(AuditService)
  })

  describe('login', () => {
    it('should persist response body to storage', () => {

      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      userService.login('abc12345', '9999a').then(() => {

          try {
            const questionSpyArgs = storageServiceSpy.setQuestions.calls.argsFor(0)
            const configSpyCalls = storageServiceSpy.setConfig.calls.argsFor(0)
            const pupilSpyArgs = storageServiceSpy.setPupil.calls.argsFor(0)
            const schoolSpyArgs = storageServiceSpy.setSchool.calls.argsFor(0)
            expect(questionSpyArgs[0].toString())
              .toEqual(`${mockLoginResponseBody[questionsDataKey.toString()]}`)
            expect(configSpyCalls[0].toString())
              .toEqual(`${mockLoginResponseBody[configDataKey.toString()]}`)
            expect(pupilSpyArgs[0].toString())
              .toEqual(`${mockLoginResponseBody[pupilDataKey.toString()]}`)
            expect(schoolSpyArgs[0].toString())
              .toEqual(`${mockLoginResponseBody[schoolDataKey.toString()]}`)
          } catch (error) {
            fail(error)
          }
        },
        (error) => {
          fail(error)
        })

      expect(httpServiceSpy.postJson).toHaveBeenCalledTimes(1)
      expect(metaServiceSpy.getTag).toHaveBeenCalledTimes(1)
    })

    it('should return a promise that rejects on invalid login', () => {
      httpServiceSpy.postJson.and.returnValue(Promise.reject(new HttpErrorResponse({
        error: { error: 'Unathorised' },
        status: 401,
        statusText: 'Unathorized'
      })))

      userService.login('xxx', 'xxx').then(
        () => {
          fail('expected to reject')
        },
        (err) => {
          expect(err).toBeTruthy()
        }
      ).catch((error) => {
        fail(error)
      })

      expect(storageService.setQuestions).not.toHaveBeenCalled()
      expect(httpServiceSpy.postJson).toHaveBeenCalledTimes(1)
    })

    it('should post expected credentials to correct endpoint', async () => {
      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      const schoolPin = 'abc12345'
      const pupilPin = '9999a'
      const expectedUrl = `${APP_CONFIG.apiBaseUrl}/auth`

      await userService.login(schoolPin, pupilPin)

      expect(httpServiceSpy.postJson).toHaveBeenCalledWith(expectedUrl, {
        schoolPin,
        pupilPin,
        buildVersion: undefined
      })
    })

    it('should add a LoginSucess audit event on successful login', async () => {
      const auditServiceSpy = spyOn(auditService, 'addEntry')

      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))

      const schoolPin = 'abc12345'
      const pupilPin = '9999a'
      await userService.login(schoolPin, pupilPin)

      expect(auditService.addEntry).toHaveBeenCalled()
      const auditArgs = auditServiceSpy.calls.argsFor(0)
      expect(auditArgs[0] instanceof LoginSuccessAuditEntryClass).toBeTrue()
    })

    it('should clear storage on a fresh login (no existing pupil in storage)', async () => {
      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      storageServiceSpy.getPupil.and.returnValue(undefined)
      storageServiceSpy.getCompletedSubmission.and.returnValue(false)

      await userService.login('abc12345', '9999a')

      expect(storageServiceSpy.clear).toHaveBeenCalledTimes(1)
    })

    it('should clear storage when re-logging in for a different check (different checkCode)', async () => {
      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      const incomingPupil = mockLoginResponseBody[pupilDataKey.toString()] as any
      storageServiceSpy.getPupil.and.returnValue({ checkCode: 'a-different-check-code' })
      storageServiceSpy.getCompletedSubmission.and.returnValue(false)

      await userService.login('abc12345', '9999a')

      expect(incomingPupil).toBeTruthy()
      expect(storageServiceSpy.clear).toHaveBeenCalledTimes(1)
    })

    it('should clear storage when the previous check has already been submitted', async () => {
      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      const incomingPupil = mockLoginResponseBody[pupilDataKey.toString()] as any
      storageServiceSpy.getPupil.and.returnValue({ checkCode: incomingPupil && incomingPupil.checkCode })
      storageServiceSpy.getCompletedSubmission.and.returnValue(true)

      await userService.login('abc12345', '9999a')

      expect(storageServiceSpy.clear).toHaveBeenCalledTimes(1)
    })

    it('should NOT clear storage when re-logging in to the same in-progress check', async () => {
      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      const incomingPupil = mockLoginResponseBody[pupilDataKey.toString()] as any
      // Same checkCode and submission not yet completed: this is a refresh-and-resume scenario
      storageServiceSpy.getPupil.and.returnValue({ checkCode: incomingPupil && incomingPupil.checkCode })
      storageServiceSpy.getCompletedSubmission.and.returnValue(false)

      await userService.login('abc12345', '9999a')

      expect(incomingPupil).toBeTruthy()
      expect(storageServiceSpy.clear).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should clear storage on logout', () => {
      userService.logout()
      expect(storageService.clear).toHaveBeenCalled()
    })
  })
})
