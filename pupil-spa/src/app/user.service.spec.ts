import {TestBed} from '@angular/core/testing';
import {HttpModule} from '@angular/http';


import {UserService} from './user.service';

let service: UserService;

describe('UserService', () => {

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [UserService]
    });
    service = injector.get(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns a promise that resolves on valid logon', () => {
    service.login('abc12345', '9999a').then(
      (res) => {
        expect(res).toBeTruthy();
      }
    );
  });

  it('returns a promise that rejects on invalid login', () => {
    service.login('xxx', 'xxx').then(
      (res) => {
        expect(1).toBe(2);
      },
      (err) => {
        expect(err).toBeTruthy();
      }
    );
  });

  it('logs a user out', () => {
    service.login('abc12345', '9999a').then(
      (res) => {
        service.logout();
        expect(service.isLoggedIn()).toBe(false);
      }
    );
  });
});
