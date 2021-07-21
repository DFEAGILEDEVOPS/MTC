import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FeedbackThanksComponent } from './feedback-thanks.component';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FeedbackThanksComponent', () => {
  let component: FeedbackThanksComponent;
  let fixture: ComponentFixture<FeedbackThanksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackThanksComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],         // we don't need to test sub-components
      providers: [
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        WindowRefService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackThanksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
