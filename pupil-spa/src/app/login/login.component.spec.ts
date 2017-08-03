import {async, ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {LoginComponent} from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter;
  let mockUserService;
  let promiseHelper;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockUserService = {
      login: function() { return undefined; }
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
        {provide: UserService, useValue: mockUserService},
        {provide: Router, useValue: mockRouter}
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
      promiseHelper.resolve({success: 'login okay'});
    });

    it('redirects to success page given a valid schoolPin and pupilPin', async () => {
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then( () => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
      });
    });

    it('a second submit is not accepted', async () => {
      component.onSubmit('goodPin', 'goodPin');
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then( () => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockUserService.login).toHaveBeenCalledTimes(1);
      });
    });

  });

  describe('on a failed login', () => {
    beforeEach(() => {
      promiseHelper.reject({error: 'login failed'});
    });

    it('redirects to an error page when the login is rejected', async () => {
      component.onSubmit('badPin', 'badPin');
      fixture.whenStable().then( () => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-failure']);
      });
    });
  });
});
