import { inject, TestBed } from '@angular/core/testing';

import { LoginErrorService } from './login-error.service';

let loginErrorService;


describe('LoginErrorService', () => {
  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        LoginErrorService
      ]
    });
    loginErrorService = injector.get(LoginErrorService);
  });
  it('should be created', inject([LoginErrorService], (service: LoginErrorService) => {
    expect(service).toBeTruthy();
  }));
  it('changeMessage should provide the new value to the BehaviorSubject', () => {
    loginErrorService.changeMessage('new message');
    const newMessage = loginErrorService.currentErrorMessage;
    newMessage.subscribe((m) => {
      expect(m).toEqual('new message');
    });
  });
});
