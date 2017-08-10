import { TestBed } from '@angular/core/testing';
import { HttpModule, Http, BaseRequestOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import * as responseMock from './login.response.mock.json';

let userService: UserService;
let storageService: StorageService;

const shouldNotExecute = () => {
  expect('this code').toBe('not executed');
};

describe('UserService', () => {

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [UserService, StorageService,
        { provide: XHRBackend, useClass: MockBackend }]
    });

    userService = injector.get(UserService);
    storageService = injector.get(StorageService);
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('should return a promise that resolves on valid logon', () => {
    userService.login('abc12345', '9999a').then(
      (res) => {
        expect(res['questions'].length).toBeGreaterThan(0);
        userService.logout();
      },
      (err) =>
      {
        shouldNotExecute();
      }
    );
  });

  it('should return a promise that rejects on invalid login', () => {
    userService.login('xxx', 'xxx').then(
      (res) => {
        shouldNotExecute();
      },
    ).catch((err) => {
        expect(err.status).toBe(401);
      }
    );
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

  it('should log the user out and clear localStorage', () => {
    spyOn(storageService,'clear');
    userService.login('abc12345', '9999a').then(
      () => {
        userService.logout();
        expect(userService.isLoggedIn()).toBe(false);
        expect(storageService.clear).toHaveBeenCalled();
      },
      (err) => {
        console.log(err);
        shouldNotExecute();
      }
    );
  });
});
