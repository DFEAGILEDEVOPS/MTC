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
import { loadConfigMockService } from '../config/config.service'
import { Meta } from '@angular/platform-browser'

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
    setToken: jasmine.Spy
  }
  let metaServiceSpy: {
    getTag: jasmine.Spy
  }

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['postJson'])
    storageServiceSpy = jasmine.createSpyObj('StorageService',
      ['clear', 'setQuestions', 'setConfig', 'setPupil', 'setSchool', 'setToken', 'getAccessArrangements']
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
        { provide: Meta, useValue: metaServiceSpy }
      ]
    })

    userService = TestBed.inject(UserService)
    storageService = TestBed.inject(StorageService)
  })

  describe('login', () => {
    it('should persist response body to storage', () => {
      // setup
      httpServiceSpy.postJson.and.returnValue(Promise.resolve(mockLoginResponseBody))
      // execute
      userService.login('abc12345', '9999a').then(() => {

          // tests
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
        (res) => {
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
  })

  describe('logout', () => {
    it('should clear storage on logout', () => {
      userService.logout()
      expect(storageService.clear).toHaveBeenCalled()
    })
  })
})
