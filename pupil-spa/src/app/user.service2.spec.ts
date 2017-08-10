import { TestBed, async, inject } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { UserService } from './user.service';
import { StorageService } from './storage.service';
import * as mockLoginResponseBody from './login.userService.response.mock.json'

const shouldNotExecute = () => {
  expect('this code').toBe('not executed');
};

let userService: UserService;
let storageService: StorageService;
let mockBackend: MockBackend;
const sessionDataKey = 'session';
const questionsDataKey = 'questions';

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
        expect(storageService.setItem).toHaveBeenCalledTimes(2);
        expect(storageService.setItem)
          .toHaveBeenCalledWith(sessionDataKey, mockLoginResponseBody['session']);
        expect(storageService.setItem)
          .toHaveBeenCalledWith(questionsDataKey, mockLoginResponseBody['questions']);
      },
        (err) => {
          shouldNotExecute();
        });
    });

    it('should return a promise that rejects on invalid login', () => {

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

    it('should return a promise that rejects when insufficient data are provided', () => {
      userService.login('xxx', '')
        .then(() => {
          shouldNotExecute();
        })
        .catch((err) => {
          expect(err.status).toBe(400);
        }
        );
    });

  });

  describe('logout', () => {

  });
});
