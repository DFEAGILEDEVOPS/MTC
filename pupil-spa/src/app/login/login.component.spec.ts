import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { LoginComponent } from './login.component';
import { Login } from './login.model';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { LoginErrorService } from '../services/login-error/login-error.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
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
      declarations: [LoginComponent],
      imports: [FormsModule],
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
        LoginErrorService
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    mockRegisterInputService = injector.get(RegisterInputService);
    mockLoginModel = injector.get(Login);
    mockCheckStatusService = injector.get(CheckStatusService);
    mockPupilPrefsService = injector.get(PupilPrefsService);
    loginErrorService = injector.get(LoginErrorService);

    spyOn(mockQuestionService, 'initialise');
    spyOn(mockWarmupQuestionService, 'initialise');
    spyOn(mockRegisterInputService, 'initialise');
    spyOn(loginErrorService, 'changeMessage');
    hasUnfinishedCheckSpy = spyOn(mockCheckStatusService, 'hasUnfinishedCheck');
    hasUnfinishedCheckSpy.and.returnValue(false);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render schoolPin and pupil pin input boxes', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#schoolPin')).toBeTruthy();
    expect(compiled.querySelector('#pupilPin')).toBeTruthy();
  });

  describe('on successful login', () => {
    beforeEach(() => {
      promiseHelper.resolve({ success: 'login okay' });
    });

    it('should initialise the QuestionService and WarmupQuestionService on login', async () => {
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockWarmupQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockRegisterInputService.initialise).toHaveBeenCalledTimes(1);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should reject a second submit', async () => {
      component.onSubmit('goodPin', 'goodPin');
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockUserService.login).toHaveBeenCalledTimes(1);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to success page given a valid schoolPin and pupilPin', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({});
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to the font selection page when fontSize is enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ fontSize: true });
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockQuestionService.getConfig).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['font-choice']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to the colour contrast page when colourContrast is enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true });
      component.onSubmit('goodPin', 'goodPin');
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
      component.onSubmit('badPin', 'badPin');
      fixture.whenStable().then(() => {
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('login failed');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in']);
        expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled();
      });
    });
  });
  describe('redirects to sign in fail page when there is no connection', () => {
    beforeEach(() => {
      promiseHelper.reject({ message: 'no connection', status: 0 });
    });

    it('redirects to an error page when the connection fails', async () => {
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('no connection');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-fail']);
        expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled();
      });
    });
  });
  describe('ngOnInit', () => {
    it('should navigate to check path with query params if an unfinished check is detected', () => {
      hasUnfinishedCheckSpy.and.returnValue(true);
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check'], { queryParams: { unfinishedCheck: true } });
    });
    it('should not navigate to check path if a completed check is detected', () => {
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledTimes(0);
    });
  });
});
