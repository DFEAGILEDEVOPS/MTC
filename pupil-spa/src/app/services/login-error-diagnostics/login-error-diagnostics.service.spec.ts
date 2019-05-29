import { inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { LoginErrorDiagnosticsService } from './login-error-diagnostics.service';
import { WindowRefService } from '../window-ref/window-ref.service';
import { LoginErrorService } from '../login-error/login-error.service';

let loginErrorDiagnosticsService;

describe('LoginErrorDiagnosticsService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loginErrorService: LoginErrorService;
  let windowRefService: WindowRefService;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoginErrorDiagnosticsService,
        WindowRefService,
        LoginErrorService
      ]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    loginErrorDiagnosticsService = injector.get(LoginErrorDiagnosticsService);
    loginErrorService = injector.get(LoginErrorService);
    windowRefService = injector.get(WindowRefService);
  });
  it('should be created', inject([LoginErrorDiagnosticsService], (service: LoginErrorDiagnosticsService) => {
    expect(service).toBeTruthy();
  }));
  describe('process', () => {
    it('should return if error status code is not 0', async () => {
      spyOn(loginErrorDiagnosticsService, 'canAccessURL');
      const err = { status: 404 };
      await loginErrorDiagnosticsService.process(err);
      expect(loginErrorDiagnosticsService.canAccessURL).not.toHaveBeenCalled();
    });
    it('should call changeMessage when api url refussed connection and internet connection is active', async () => {
      spyOn(loginErrorDiagnosticsService, 'canAccessURL').and.returnValue(false);
      spyOn(loginErrorService, 'changeMessage');
      const err = { status: 0 };
      await loginErrorDiagnosticsService.process(err);
      expect(loginErrorService.changeMessage).toHaveBeenCalledWith('Connection refused to undefined');
    });
  });
});
