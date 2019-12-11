import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPendingComponent } from './login-pending.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../services/user/user.service';
import { Login } from '../login/login.model';
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
  let mockLoginModel;
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
        { provide: Login, useValue: mockLoginModel },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } } } },
        LoginErrorService,
        LoginErrorDiagnosticsService,
        WindowRefService
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    mockRegisterInputService = injector.get(RegisterInputService);
    mockLoginModel = injector.get(Login);
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
    component = fixture.componentInstance;
    activatedRoute = TestBed.get(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
