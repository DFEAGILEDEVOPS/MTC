import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';
import { LoginComponent } from './login.component';
import { QuestionService } from '../services/question.service';
import { QuestionServiceMock } from '../services/question.service.mock';
import { StorageService } from '../services/storage.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter;
  let mockUserService;
  let promiseHelper;
  const mockQuestionService = new QuestionServiceMock();

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

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useValue: mockQuestionService }
      ]
    }).compileComponents();

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
    expect(compiled.querySelector('#school-pin')).toBeTruthy();
    expect(compiled.querySelector('#pupil-pin')).toBeTruthy();
  });

  describe('on successful login', () => {

    beforeEach(() => {
      promiseHelper.resolve({ success: 'login okay' });
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
