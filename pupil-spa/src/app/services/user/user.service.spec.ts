import { TestBed } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { UserService } from './user.service';
import { StorageService } from '../storage/storage.service';
import * as mockLoginResponseBody from '../../login.userService.response.mock.json';
import { AppConfigService, loadConfigMockService } from '../config/config.service';

const shouldNotExecute = () => {
  expect('this code').toBe('not executed');
};

let userService: UserService;
let storageService: StorageService;
let mockBackend: MockBackend;
const pupilDataKey = 'pupil';
const questionsDataKey = 'questions';
const configDataKey = 'config';

describe('UserService', () => {

  beforeEach(() => {

    const inject = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        UserService,
        { provide: XHRBackend, useClass: MockBackend },
        StorageService
      ]
    });

    userService = inject.get(UserService);
    storageService = inject.get(StorageService);
    mockBackend = inject.get(XHRBackend);

  });

  describe('login', () => {

    it('should persist response body to storage', () => {

      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockLoginResponseBody),
          status: 200
        })));
      });

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
    });

    it('should return a promise that rejects on invalid login', () => {

      spyOn(storageService, 'setItem');

      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify(mockLoginResponseBody),
          status: 401
        })));
      });

      userService.login('xxx', 'xxx').then(
        (res) => {
          shouldNotExecute();
        },
        (err) => {
          expect(err).toBeTruthy();
        }
      ).catch((err) => {
        shouldNotExecute();
      });

      expect(storageService.setItem).not.toHaveBeenCalled();
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
