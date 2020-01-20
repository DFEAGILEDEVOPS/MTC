import { TestBed, inject } from '@angular/core/testing';
import { CanExitGuard, CanExit} from './can-exit.guard';

describe('CanExitGuard', () => {

  const trueComponent: CanExit = { canDeactivate: () => true };
  const falseComponent: CanExit = { canDeactivate: () => false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CanExitGuard
      ]
    });
  });

  it('should instantiate', inject([CanExitGuard], (guard: CanExitGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return false if component canDeactivate method returns false', inject([CanExitGuard], (guard: CanExitGuard) => {
    expect(guard.canDeactivate(falseComponent)).toBeFalsy();
  }));

  it('should return true if component canDeactivate method returns true', inject([CanExitGuard], (guard: CanExitGuard) => {
    expect(guard.canDeactivate(trueComponent)).toBeTruthy();
  }));
});
