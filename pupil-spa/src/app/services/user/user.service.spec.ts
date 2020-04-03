import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { StorageService } from '../storage/storage.service';
import { default as mockLoginResponseBody } from '../../login.userService.response.mock.json';
import { APP_CONFIG, AppConfigService, loadConfigMockService } from '../config/config.service';
import {
  ConfigStorageKey,
  PupilStorageKey,
  QuestionsStorageKey,
  SchoolStorageKey,
  TokensStorageKey
} from '../storage/storageKey';

let userService: UserService;
let storageService: StorageService;
const questionsDataKey = new QuestionsStorageKey();
const pupilDataKey = new PupilStorageKey();
const configDataKey = new ConfigStorageKey();
const schoolDataKey = new SchoolStorageKey();
const tokensDataKey =  new TokensStorageKey();

describe('UserService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {

    const inject = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        StorageService
      ]
    });

    // Inject the http service and test controller for each test
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    userService = inject.get(UserService);
    storageService = inject.get(StorageService);
  });

  describe('login', () => {
    it('should persist response body to storage', () => {
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

      const req = httpTestingController.expectOne(`${APP_CONFIG.authURL}`);
      req.flush(mockLoginResponseBody);

      // Finally, assert that there are no outstanding requests.
      httpTestingController.verify();
    });

    it('should return a promise that rejects on invalid login', () => {
      spyOn(storageService, 'setQuestions');

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

      const req = httpTestingController.expectOne(`${APP_CONFIG.authURL}`);
      req.flush('Unauthorised', { status: 401, statusText: 'Not authorised' });

      // Finally, assert that there are no outstanding requests.
      httpTestingController.verify();
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
