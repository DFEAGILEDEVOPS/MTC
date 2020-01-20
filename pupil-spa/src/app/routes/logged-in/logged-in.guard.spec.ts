import { TestBed, async, inject } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoggedInGuard } from './logged-in.guard';
import { UserService } from '../../services/user/user.service';

let mockRouter;
let mockUser;
let isLoggedIn = false;

describe('LoggedInGuard', () => {
  mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };
  mockUser = {
    isLoggedIn() {
      return isLoggedIn;
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggedInGuard,
        { provide: UserService, useValue: mockUser },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should instantiate', inject([LoggedInGuard], (guard: LoggedInGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should redirect when the user is not signed in', inject([LoggedInGuard], (guard: LoggedInGuard) => {
    expect(guard.canActivate()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalled();
  }));

  it('should return true when the user is signed in', inject([LoggedInGuard], (guard: LoggedInGuard) => {
    isLoggedIn = true;
    expect(guard.canActivate()).toBe(true);
  }));
});
