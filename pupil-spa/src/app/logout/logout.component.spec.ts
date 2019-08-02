import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { UserService } from '../services/user/user.service';
import { LogoutComponent } from './logout.component';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let mockRouter;
  let mockUserService;
  let mockQuestionService;
  let mockWarmupQuestionService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    mockUserService = {
      logout: jasmine.createSpy('logout')
    };
    const injector = TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
      ],
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    spyOn(mockQuestionService, 'reset');
    spyOn(mockWarmupQuestionService, 'reset');
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
    expect(mockQuestionService.reset).toHaveBeenCalledTimes(1);
    expect(mockWarmupQuestionService.reset).toHaveBeenCalledTimes(1);
  });

  it('should navigate to the sign-in page', () => {
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

});
