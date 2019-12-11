import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPendingComponent } from './login-pending.component';
import { APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../services/user/user.service';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { LoginErrorService } from '../services/login-error/login-error.service';
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { loadConfigMockService } from '../services/config/config.service';



describe('LoginPendingComponent', () => {
  let component: LoginPendingComponent;
  let fixture: ComponentFixture<LoginPendingComponent>;
  let mockRouter;
  let mockUserService;
  let promiseHelper;
  let mockQuestionService;
  let mockWarmupQuestionService;
  let mockRegisterInputService;
  let mockCheckStatusService;
  let mockPupilPrefsService;
  let hasUnfinishedCheckSpy;
  let loginErrorService;
  let loginErrorDiagnosticsService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let windowRefService: WindowRefService;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockUserService = {
      login: function () {
        return undefined;
      }
    };

    mockPupilPrefsService = {
      loadPupilPrefs: jasmine.createSpy('loadPupilPrefs')
    };

    const loginPromise = new Promise((resolve, reject) => {
      promiseHelper = {
        resolve,
        reject
      };
    });

    spyOn(mockUserService, 'login').and.returnValue(loginPromise);

    const injector = TestBed.configureTestingModule({
      declarations: [LoginPendingComponent],
      imports: [FormsModule, HttpClientTestingModule],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: UserService, useValue: mockUserService },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } } } },
        LoginErrorService,
        LoginErrorDiagnosticsService,
        WindowRefService
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    mockRegisterInputService = injector.get(RegisterInputService);
    mockCheckStatusService = injector.get(CheckStatusService);
    mockPupilPrefsService = injector.get(PupilPrefsService);
    loginErrorService = injector.get(LoginErrorService);
    loginErrorDiagnosticsService = injector.get(LoginErrorDiagnosticsService);
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    windowRefService = injector.get(WindowRefService);

    spyOn(mockQuestionService, 'initialise');
    spyOn(mockWarmupQuestionService, 'initialise');
    spyOn(mockRegisterInputService, 'initialise');
    spyOn(loginErrorService, 'changeMessage');
    hasUnfinishedCheckSpy = spyOn(mockCheckStatusService, 'hasUnfinishedCheck');
    hasUnfinishedCheckSpy.and.returnValue(false);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPendingComponent);
    activatedRoute = TestBed.get(ActivatedRoute);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should successfully create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('on successful login', () => {
    beforeEach(() => {
      promiseHelper.resolve({ success: 'login okay' });
    });

    it('should initialise the QuestionService and WarmupQuestionService on login', async () => {
      activatedRoute.snapshot.queryParams.schoolPin = 'goodPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'goodPin';
      await component.ngOnInit();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockWarmupQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockRegisterInputService.initialise).toHaveBeenCalledTimes(1);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should reject a second submit', async () => {
      activatedRoute.snapshot.queryParams.schoolPin = 'goodPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'goodPin';
      await component.ngOnInit();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockUserService.login).toHaveBeenCalledTimes(1);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to success page given a valid schoolPin and pupilPin', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({});
      activatedRoute.snapshot.queryParams.schoolPin = 'goodPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'goodPin';
      await component.ngOnInit();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to the font selection page when fontSize is enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ fontSize: true });
      activatedRoute.snapshot.queryParams.schoolPin = 'goodPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'goodPin';
      await component.ngOnInit();
      fixture.whenStable().then(() => {
        expect(mockQuestionService.getConfig).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['font-choice']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to the colour contrast page when colourContrast is enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true });
      activatedRoute.snapshot.queryParams.schoolPin = 'goodPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'goodPin';
      await component.ngOnInit();
      fixture.whenStable().then(() => {
        expect(mockQuestionService.getConfig).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });
  });

  describe('should fail logging in when PIN(s) are invalid', () => {
    beforeEach(() => {
      promiseHelper.reject({ message: 'login failed', status: 401 });
    });

    it('redirects to login page when the school and pupil pin credentials are rejected', async () => {
      activatedRoute.snapshot.queryParams.schoolPin = 'badPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'badPin';
      await component.ngOnInit();
      fixture.whenStable().then(() => {
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('login failed');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in'], { queryParams: { loginSucceeded: false } });
        expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled();
      });
    });
  });
  describe('redirects to sign in fail page when there is no connection', () => {
    beforeEach(() => {
      promiseHelper.reject({ message: 'no connection', status: 0 });
    });

    it('redirects to an error page when the connection fails', async () => {
      activatedRoute.snapshot.queryParams.schoolPin = 'goodPin';
      activatedRoute.snapshot.queryParams.pupilPin = 'goodPin';
      await component.ngOnInit();
      spyOn(loginErrorDiagnosticsService, 'process');
      fixture.whenStable().then(() => {
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('no connection');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-fail']);
        expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled();
        expect(loginErrorDiagnosticsService.process).toHaveBeenCalled();
      });
    });
  });
});
