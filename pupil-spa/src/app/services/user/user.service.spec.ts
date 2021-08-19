import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from './user.service';
import { StorageService } from '../storage/storage.service';
import { default as mockLoginResponseBody } from '../../login.userService.response.mock.json';
import {
  ConfigStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey,
  TokensStorageKey
} from '../storage/storageKey';
import { HttpService } from '../http/http.service';

let userService: UserService;
let storageService: StorageService;
const questionsDataKey = new QuestionsStorageKey();
const pupilDataKey = new PupilStorageKey();
const configDataKey = new ConfigStorageKey();
const schoolDataKey = new SchoolStorageKey();
const tokensDataKey =  new TokensStorageKey();

describe('UserService', () => {
  let httpServiceSpy: { post: jasmine.Spy };

  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post']);
    const inject = TestBed.configureTestingModule({
      imports: [],
      providers: [
        UserService,
        StorageService,
        { provide: HttpService, useValue: httpServiceSpy }
      ]
    });

    userService = inject.get(UserService);
    storageService = inject.get(StorageService);
  });

  describe('login', () => {
    it('should persist response body to storage', () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockLoginResponseBody));
      const setQuestionsSpy = spyOn(storageService, 'setQuestions');
      const setConfigSpy = spyOn(storageService, 'setConfig');
      const setPupilSpy = spyOn(storageService, 'setPupil');
      const setSchoolSpy = spyOn(storageService, 'setSchool');
      userService.login('abc12345', '9999a').then(() => {

        try {
          const questionSpyArgs = setQuestionsSpy.calls.allArgs();
          const configSpyCalls = setConfigSpy.calls.allArgs();
          const pupilSpyArgs = setPupilSpy.calls.allArgs();
          const schoolSpyArgs = setSchoolSpy.calls.allArgs();
            expect(questionSpyArgs[0][0].toString())
              .toEqual(`${mockLoginResponseBody[questionsDataKey.toString()]}`);
            expect(configSpyCalls[0][0].toString())
              .toEqual(`${mockLoginResponseBody[configDataKey.toString()]}`);
            expect(pupilSpyArgs[0][0].toString())
              .toEqual(`${mockLoginResponseBody[pupilDataKey.toString()]}`);
            expect(schoolSpyArgs[0][0].toString())
              .toEqual(`${mockLoginResponseBody[schoolDataKey.toString()]}`);
          } catch (error) {
            fail(error);
          }
        },
        (error) => {
          fail(error);
        });

      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1);
    });

    it('should return a promise that rejects on invalid login', () => {
      spyOn(storageService, 'setQuestions');
      httpServiceSpy.post.and.returnValue(Promise.reject(new HttpErrorResponse({
        error: { error: 'Unathorised' },
        status: 401,
        statusText: 'Unathorized'
      })));

      userService.login('xxx', 'xxx').then(
        (res) => {
          fail('expected to reject');
        },
        (err) => {
          expect(err).toBeTruthy();
        }
      ).catch((error) => {
        fail(error);
      });

      expect(storageService.setQuestions).not.toHaveBeenCalled();
      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should clear storage on logout', () => {
      spyOn(storageService, 'clear');
      userService.logout();
      expect(storageService.clear).toHaveBeenCalled();
    });
  });
});
