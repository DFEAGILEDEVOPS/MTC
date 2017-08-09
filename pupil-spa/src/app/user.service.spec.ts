import { TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { StorageService } from './storage.service';
import { UserService } from './user.service';

let userService: UserService;

describe('UserService', () => {

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [UserService, StorageService]
    });
    userService = injector.get(UserService, StorageService);
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('returns a promise that resolves on valid logon', () => {
    userService.login('abc12345', '9999a').then(
      (res) => {
        expect(res['questions'].length).toBeGreaterThan(0);
      }
    );
  });

  it('returns a promise that rejects on invalid login', () => {
    userService.login('xxx', 'xxx').then(
      (res) => {
        expect(1).toBe(2);
      },
    ).catch((err) => {
      expect(err.status).toBe(401);
      }
    );
  });

  it('returns a promise that rejects when insufficient data are provided', () => {
    userService.login('xxx', '').then().catch((err) => {
        expect(err.status).toBe(400);
      }
    );
  });

  it('logs a user out', () => {
    userService.login('abc12345', '9999a').then(
      () => {
        userService.logout();
        expect(userService.isLoggedIn()).toBe(false);
      }
    );
  });
});
