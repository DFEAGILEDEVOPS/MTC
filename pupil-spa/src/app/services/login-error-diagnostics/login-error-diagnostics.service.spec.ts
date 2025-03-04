import { inject, TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { LoginErrorDiagnosticsService } from './login-error-diagnostics.service'
import { WindowRefService } from '../window-ref/window-ref.service'
import { LoginErrorService } from '../login-error/login-error.service'
import { APP_INITIALIZER } from '@angular/core'
import { loadConfigMockService } from '../config/config.service'
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

let loginErrorDiagnosticsService

describe('LoginErrorDiagnosticsService', () => {

  let loginErrorService: LoginErrorService

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
    imports: [],
    providers: [
        LoginErrorDiagnosticsService,
        WindowRefService,
        LoginErrorService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    TestBed.inject(HttpClient)
    TestBed.inject(HttpTestingController)
    loginErrorDiagnosticsService = injector.inject(LoginErrorDiagnosticsService)
    loginErrorService = injector.inject(LoginErrorService)
    injector.inject(WindowRefService)
    loginErrorDiagnosticsService = injector.inject(LoginErrorDiagnosticsService)
    loginErrorService = injector.inject(LoginErrorService)
  })

  it('should be created', inject([LoginErrorDiagnosticsService], (service: LoginErrorDiagnosticsService) => {
    expect(service).toBeTruthy()
  }))

  describe('process', () => {
    it('should return if error status code is not 0', async () => {
      spyOn(loginErrorDiagnosticsService, 'canAccessURL')
      const err = { status: 404 }
      await loginErrorDiagnosticsService.process(err)
      expect(loginErrorDiagnosticsService.canAccessURL).not.toHaveBeenCalled()
    })

    it('should call changeMessage when api url refused connection and browser status is online',
      inject([LoginErrorDiagnosticsService], async (service: LoginErrorDiagnosticsService) => {
        spyOn(loginErrorDiagnosticsService, 'canAccessURL').and.returnValue(false)
        spyOn(loginErrorService, 'changeMessage')
        const err = { status: 0 }
        service.isBrowserStatusOnline = true
        await loginErrorDiagnosticsService.process(err)
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('Connection refused to apiBaseUrl/ping')
      })
    )
  })
})
