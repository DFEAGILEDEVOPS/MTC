import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';

import { CheckComponent } from './check.component';
import { QuestionService } from '../services/question/question.service';
import { AnswerService } from '../services/answer/answer.service';
import { StorageService } from '../services/storage/storage.service';
import { SubmissionService } from '../services/submission/submission.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WarmupQuestionService } from '../services/question/warmup-question.service';

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [HttpModule],
      declarations: [CheckComponent],
      schemas: [NO_ERRORS_SCHEMA],         // we don't need to test sub-components
      providers: [
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        AnswerService,
        StorageService,
        SubmissionService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('default view should be the warmup-intro screen', () => {
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('app-warmup-intro')).toBeTruthy();
    });
  });

  xit('setting the viewState to question shows the question screen', () => {
    component.viewState = 'question';
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('app-question')).toBeTruthy();
      // console.log(compiled);
    });
  });

  xit('setting the viewState to complete shows the check complete screen', () => {
    component.viewState = 'complete';
    fixture.whenStable().then(() => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('app-check-complete')).toBeTruthy();
      }
    );
  });

  describe('manualSubmitHandler', () => {
    it('calls changeState()', () => {
      const beforeState = component['state'];
      component.manualSubmitHandler('testinput');
      const afterState = component['state'];
      expect(afterState).toBe(beforeState + 1);
    });
  });

  xdescribe('questionTimeoutHandler()', () => {
    // it('calls nextQuestion()', () => {
    //   spyOn(component, 'nextQuestion');
    //   component.questionTimeoutHandler('testinput');
    //   expect(component.nextQuestion).toHaveBeenCalledTimes(1);
    // });
  });

  describe('loadingTimeoutHandler', () => {
    it('increments the state', () => {
      const beforeState = component['state'];
      component.loadingTimeoutHandler();
      const afterState = component['state'];
      expect(afterState).toBe(beforeState + 1);
    });
  });
});
