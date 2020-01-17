import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OutOfTimeComponent } from './out-of-time.component';
import { StorageService } from '../services/storage/storage.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { UserService } from '../services/user/user.service';
import { UserServiceMock } from '../services/user/user.service.mock';

describe('OutOfTimeComponent', () => {
  let component: OutOfTimeComponent;
  let fixture: ComponentFixture<OutOfTimeComponent>;
  let mockQuestionService;
  let mockWarmupQuestionService;
  let mockUserService;
  let storageService;

  beforeEach(async(() => {
    const injector = TestBed.configureTestingModule({
      declarations: [ OutOfTimeComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        WindowRefService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: UserService, useClass: UserServiceMock},
        StorageService
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    mockUserService = injector.get(UserService);
    storageService = injector.get(StorageService);

    spyOn(mockQuestionService, 'reset');
    spyOn(mockWarmupQuestionService, 'reset');
    spyOn(mockUserService, 'logout');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutOfTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should logout the user', () => {
    expect(mockUserService.logout).toHaveBeenCalledTimes(1);
    expect(mockQuestionService.reset).toHaveBeenCalledTimes(1);
    expect(mockWarmupQuestionService.reset).toHaveBeenCalledTimes(1);
  });
});
