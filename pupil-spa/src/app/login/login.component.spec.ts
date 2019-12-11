import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { Login } from './login.model';
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LoginErrorService } from '../services/login-error/login-error.service';
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter;
  let mockCheckStatusService;
  let mockLoginModel;
  let hasUnfinishedCheckSpy;
  let loginErrorService;
  let loginErrorDiagnosticsService;
  let httpTestingController: HttpTestingController;
  let windowRefService: WindowRefService;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, HttpClientTestingModule],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: Login, useValue: mockLoginModel },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } } } },
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        LoginErrorService,
        LoginErrorDiagnosticsService,
        WindowRefService
      ]
    });
    mockLoginModel = injector.get(Login);
    mockCheckStatusService = injector.get(CheckStatusService);
    loginErrorService = injector.get(LoginErrorService);
    loginErrorDiagnosticsService = injector.get(LoginErrorDiagnosticsService);
    httpTestingController = TestBed.get(HttpTestingController);
    spyOn(loginErrorService, 'changeMessage');
    hasUnfinishedCheckSpy = spyOn(mockCheckStatusService, 'hasUnfinishedCheck');
    hasUnfinishedCheckSpy.and.returnValue(false);
    windowRefService = injector.get(WindowRefService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    activatedRoute = TestBed.get(ActivatedRoute);
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
    it('should set loginSucceeded to false if query param is false', () => {
      activatedRoute.snapshot.queryParams.loginSucceeded = false;
      component.ngOnInit();
      expect(component.loginSucceeded).toBeFalsy();
    });
  });
  describe('onSubmit', () => {
    it('redirects to an login pending page', async () => {
      component.onSubmit('schoolPin', 'pupilPin');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-pending'], {queryParams: {schoolPin: 'schoolPin', pupilPin: 'pupilPin'}});
    });
  });
});
