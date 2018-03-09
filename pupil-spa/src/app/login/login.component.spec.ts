import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user/user.service';
import { LoginComponent } from './login.component';
import { Login } from './login.model';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter;
  let mockUserService;
  let promiseHelper;
  let mockQuestionService;
  let mockWarmupQuestionService;
  let mockRegisterInputService;
  let mockLoginModel;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockUserService = {
      login: function () {
        return undefined;
      }
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
      providers: [
        { provide: Login, useValue: mockLoginModel },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock }
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    mockRegisterInputService = injector.get(RegisterInputService);
    mockLoginModel = injector.get(Login);

    spyOn(mockQuestionService, 'initialise');
    spyOn(mockWarmupQuestionService, 'initialise');
    spyOn(mockRegisterInputService, 'initialise');
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
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockWarmupQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockRegisterInputService.initialise).toHaveBeenCalledTimes(1);
      });
    });

    it('should redirect to success page given a valid schoolPin and pupilPin', async () => {
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
      });
    });

    it('should reject a second submit', async () => {
      component.onSubmit('goodPin', 'goodPin');
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockUserService.login).toHaveBeenCalledTimes(1);
      });
    });

  });

  describe('should fail logging in when PIN(s) are invalid', () => {
    beforeEach(() => {
      promiseHelper.reject({ error: 'login failed' });
    });

    it('redirects to an error page when the login is rejected', async () => {
      component.onSubmit('badPin', 'badPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-failure']);
      });
    });
  });
});
