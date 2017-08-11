import { TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { StorageService } from './storage.service';
import { UserService } from './user.service';
import * as responseMock from './login.response.mock.json';

let userService: UserService;
let storageService: StorageService;

describe('UserService', () => {
  let store: {};

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [UserService, StorageService]
    });

    userService = injector.get(UserService);
    storageService = injector.get(StorageService);

    spyOn(storageService, 'getItem').and.callFake(function (key) {
      return JSON.stringify(responseMock);
    });

    spyOn(storageService, 'setItem').and.callFake(function (key, value) {
      return store[key] = value + '';
    });

    spyOn(storageService, 'clear').and.callFake(function () {
      store = {};
    });
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('should return a promise that resolves on valid logon', () => {
    userService.login('abc12345', '9999a').then(
      (res) => {
        expect(res['questions'].length).toBeGreaterThan(0);
        userService.logout();
      }
    );
  });

  it('should return a promise that rejects on invalid login', () => {
    userService.login('xxx', 'xxx').then(
      (res) => {
        expect(1).toBe(2);
      },
    ).catch((err) => {
        expect(err.status).toBe(401);
      }
    );
  });

  it('should return a promise that rejects when insufficient data are provided', () => {
    userService.login('xxx', '')
      .then()
      .catch((err) => {
        expect(err.status).toBe(400);
      }
    );
  });

  it('should log the user out', () => {
    userService.login('abc12345', '9999a').then(
      () => {
        userService.logout();
        expect(userService.isLoggedIn()).toBe(false);
      }
    );
  });
});
