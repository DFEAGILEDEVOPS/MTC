import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { HttpClient } from '@angular/common/http'

import { APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core'
import { CheckStatusService } from '../services/check-status/check-status.service'
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock'
import { DeviceService } from '../services/device/device.service'
import { Login } from './login.model'
import { LoginComponent } from './login.component'
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service'
import { LoginErrorService } from '../services/login-error/login-error.service'
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'
import { StorageService } from '../services/storage/storage.service'
import { UserService } from '../services/user/user.service'
import { WarmupQuestionService } from '../services/question/warmup-question.service'
import { WindowRefService } from '../services/window-ref/window-ref.service'
import { loadConfigMockService } from '../services/config/config.service'
import { QrCodeUsageService } from '../services/qr-code-usage/qr-code-usage.service'
import { AuditService } from '../services/audit/audit.service'

describe('LoginComponent', () => {
  let component: LoginComponent
  let fixture: ComponentFixture<LoginComponent>
  let mockRouter
  let mockUserService
  let mockQuestionService
  let mockWarmupQuestionService
  let mockCheckStatusService
  let mockPupilPrefsService
  let mockLoginModel
  let hasUnfinishedCheckSpy
  let loginErrorService
  let loginErrorDiagnosticsService
  let mockDeviceService
  let qrCodeUsageService: QrCodeUsageService

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }

    mockDeviceService = {
      isLocalStorageEnabled: () => true,
      isUnsupportedBrowser: () => false,
      setupDeviceCookie: () => {}
    }

    mockUserService = {
      login: function () {
        return undefined
      }
    }

    mockPupilPrefsService = {
      loadPupilPrefs: jasmine.createSpy('loadPupilPrefs')
    }

    const injector = TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA], // we don't need to test sub-components
      providers: [
        { provide: DeviceService, useValue: mockDeviceService },
        LoginErrorDiagnosticsService,
        LoginErrorService,
        StorageService,
        WindowRefService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        { provide: Login, useValue: mockLoginModel },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: Router, useValue: mockRouter },
        { provide: UserService, useValue: mockUserService },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: QrCodeUsageService, useClass: QrCodeUsageService }, // original
        { provide: AuditService, useClass: AuditService } // original
      ]
    })
    mockQuestionService = injector.inject(QuestionService)
    mockWarmupQuestionService = injector.inject(WarmupQuestionService)
    mockLoginModel = injector.inject(Login)
    mockCheckStatusService = injector.inject(CheckStatusService)
    mockPupilPrefsService = injector.inject(PupilPrefsService)
    loginErrorService = injector.inject(LoginErrorService)
    loginErrorDiagnosticsService = injector.inject(LoginErrorDiagnosticsService)
    TestBed.inject(HttpClient)
    TestBed.inject(HttpTestingController)
    TestBed.inject(StorageService)
    injector.inject(WindowRefService)
    mockDeviceService = TestBed.inject(DeviceService)
    qrCodeUsageService = TestBed.inject(QrCodeUsageService)

    spyOn(mockQuestionService, 'initialise')
    spyOn(mockWarmupQuestionService, 'initialise')
    spyOn(loginErrorService, 'changeMessage')
    hasUnfinishedCheckSpy = spyOn(mockCheckStatusService, 'hasUnfinishedCheck')
    hasUnfinishedCheckSpy.and.returnValue(false)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent)
    fixture.detectChanges()
    component = fixture.componentInstance
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })

  it('should render schoolPin and pupil pin input boxes', () => {
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('#schoolPin')).toBeTruthy()
    expect(compiled.querySelector('#pupilPin')).toBeTruthy()
  })

  it('redirects to the local-storage-error page if the local storage does not work', fakeAsync(() => {
    spyOn(mockDeviceService, 'isLocalStorageEnabled').and.returnValue(false)
    component.ngOnInit()
    tick(2)
    expect(component.isLocalStorageEnabled).toBe(false)
    expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['local-storage-error'])
  }))

  describe('before login submission', () => {
    it('should set loginPending to false', async () => {
      expect(component.loginPending).toBeFalsy()
    })
  })

  describe('during login submission', () => {
    it('should set the loginPending to true', async () => {
      spyOn(mockUserService, 'login').and.returnValue(Promise.resolve(true))
      component.onSubmit('goodPin', 'goodPin')
      expect(component.loginPending).toBeTruthy()
    })
  })

  describe('on successful login', () => {
    beforeEach(() => {
      spyOn(mockUserService, 'login').and.returnValue(Promise.resolve(true))
    })

    it('should set the loginPending to false', fakeAsync(() => {
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(component.loginPending).toBeFalsy()
    }))

    it('should initialise the QuestionService and WarmupQuestionService on login', fakeAsync(() => {
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(mockRouter.navigate).toHaveBeenCalled()
      expect(mockQuestionService.initialise).toHaveBeenCalledTimes(1)
      expect(mockWarmupQuestionService.initialise).toHaveBeenCalledTimes(1)
      expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled()
    }))

    it('should prevent a second submit', fakeAsync(() => {
      component.onSubmit('goodPin', 'goodPin')
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(mockRouter.navigate).toHaveBeenCalled()
      expect(mockUserService.login).toHaveBeenCalledTimes(1)
      expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled()
    }))

    it('should redirect to success page given a valid schoolPin and pupilPin', fakeAsync(() => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({})
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success'])
      expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled()
    }))

    it('should set-up the device cookie if it is a live check', fakeAsync(() => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ practice: false })
      spyOn(component['deviceService'], 'setupDeviceCookie')
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(component['deviceService'].setupDeviceCookie).toHaveBeenCalledTimes(1)
    }))

    it('does not set-up the device cookie if it is a practice check', fakeAsync(() => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ practice: true })
      spyOn(component['deviceService'], 'setupDeviceCookie')
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(component['deviceService'].setupDeviceCookie).not.toHaveBeenCalled()
    }))

    it('should redirect to the font selection page when fontSize is enabled', fakeAsync(() => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ fontSize: true })
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(mockQuestionService.getConfig).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['font-choice'])
      expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled()
    }))

    it('should redirect to the colour contrast page when colourContrast is enabled', fakeAsync(() => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true })
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(mockQuestionService.getConfig).toHaveBeenCalled()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice'])
      expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled()
    }))

    it('should call the QrCodeService to store in-memory transactions to local storage', async () => {
      spyOn(qrCodeUsageService, 'postLoginHook').and.callThrough()
      // Reasons for storing them: 1) to pass them as auditEvents to the DB and
      // 2) to allow the app re-initialise should the app be reloaded whilst running.

      // Test setup - populate the QrCodeUsage service with some variables
      qrCodeUsageService.qrCodeArrival()
      qrCodeUsageService.qrCodeSubsequentAppUsageIfNeeded()
      qrCodeUsageService.qrCodeSubsequentAppUsageIfNeeded()
      // Set up spies
      spyOn(qrCodeUsageService, 'storeToLocalStorage')

      // Test Execution
      await component.onSubmit('goodPin', 'goodPin')

      // Verification
      expect(qrCodeUsageService.postLoginHook).toHaveBeenCalled()
      // deeper verification
      expect(qrCodeUsageService.storeToLocalStorage).toHaveBeenCalled()
    })
  })

  describe('should fail logging in when PIN(s) are invalid', () => {
    beforeEach(() => {
      spyOn(mockUserService, 'login').and.returnValue(Promise.reject({ message: 'login failed', status: 401 }))
    })

    it('changes the loginPending to be false', fakeAsync(() => {
      component.onSubmit('badPin', 'badPin')
      tick(2)
      expect(mockUserService.login).toHaveBeenCalled()
      expect(component.loginPending).toBeFalsy()
    }))

    it('redirects to login page when the school and pupil pin credentials are rejected', fakeAsync(() => {
      component.onSubmit('badPin', 'badPin')
      tick(2)
      expect(loginErrorService.changeMessage).toHaveBeenCalledWith('login failed')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in'])
      expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled()
    }))
  })

  describe('redirects to sign in fail page when there is no connection', () => {
    beforeEach(() => {
      spyOn(mockUserService, 'login').and.returnValue(Promise.reject({ message: 'no connection', status: 0 }))
    })

    it('redirects to an error page when the connection fails', fakeAsync(() => {
      spyOn(loginErrorDiagnosticsService, 'process')
      component.onSubmit('goodPin', 'goodPin')
      tick(2)
      expect(loginErrorService.changeMessage).toHaveBeenCalledWith('no connection')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-fail'])
      expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled()
      expect(loginErrorDiagnosticsService.process).toHaveBeenCalled()
    }))
  })

  describe('ngOnInit', () => {
    it('should set the loginPending to false', async () => {
      component.ngOnInit()
      expect(component.loginPending).toBeFalsy()
    })

    it('should navigate to check path with query params if an unfinished check is detected', () => {
      hasUnfinishedCheckSpy.and.returnValue(true)
      component.ngOnInit()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check'], { queryParams: { unfinishedCheck: true } })
    })

    it('should not navigate to check path if a completed check is detected', () => {
      component.ngOnInit()
      expect(mockRouter.navigate).toHaveBeenCalledTimes(0)
    })
  })
})
