import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { StorageService } from '../storage/storage.service';
import * as mockLoginResponseBody from '../../login.userService.response.mock.json';
import { APP_CONFIG, AppConfigService, loadConfigMockService } from '../config/config.service';

const shouldNotExecute = () => {
  expect('this code').toBe('not executed');
};

let userService: UserService;
let storageService: StorageService;
const pupilDataKey = 'pupil';
const questionsDataKey = 'questions';
const configDataKey = 'config';

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
      spyOn(storageService, 'setItem');

      userService.login('abc12345', '9999a').then(() => {
          expect(storageService.setItem)
            .toHaveBeenCalledWith(pupilDataKey, mockLoginResponseBody[pupilDataKey]);
          expect(storageService.setItem)
            .toHaveBeenCalledWith(questionsDataKey, mockLoginResponseBody[questionsDataKey]);
          expect(storageService.setItem)
            .toHaveBeenCalledWith(configDataKey, mockLoginResponseBody[configDataKey]);
        },
        (err) => {
          shouldNotExecute();
        });

      const req = httpTestingController.expectOne(`${APP_CONFIG.authURL}`);
      req.flush(mockLoginResponseBody);

      // Finally, assert that there are no outstanding requests.
      httpTestingController.verify();
    });

    it('should return a promise that rejects on invalid login', () => {
      spyOn(storageService, 'setItem');

      userService.login('xxx', 'xxx').then(
        (res) => {
          fail('expected to reject');
        },
        (err) => {
          expect(err).toBeTruthy();
        }
      ).catch((err) => {
        shouldNotExecute();
      });

      expect(storageService.setItem).not.toHaveBeenCalled();

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
