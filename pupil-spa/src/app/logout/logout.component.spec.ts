import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { UserService } from '../user.service';
import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let mockRouter;
  let mockUserService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    mockUserService = {
      logout: jasmine.createSpy('logout')
    };
    TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        {provide: UserService, useValue: mockUserService},
        {provide: Router, useValue: mockRouter}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have signed out of the user service', () => {
    expect(mockUserService.logout).toHaveBeenCalled();
  });

  it('should navigate to the sign-in page', () => {
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in']);
  });

});
