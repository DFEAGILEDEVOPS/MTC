import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CheckComponent } from './check.component';
import { QuestionService } from '../services/question/question.service';
import { AnswerService } from '../services/answer/answer.service';
import { StorageService } from '../services/storage/storage.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

const mockQuestionService = new QuestionServiceMock();

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [CheckComponent],
      schemas: [NO_ERRORS_SCHEMA],         // we don't need to test sub-components
      providers: [
        { provide: QuestionService, useValue: mockQuestionService },
        AnswerService,
        StorageService
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

  it('default view should be the loading screen', () => {
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      // console.log('1 ' + compiled.innerHTML);
      expect(compiled.querySelector('app-loading')).toBeTruthy();
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


  it('calling nextQuestion shows the next question', () => {
    component.nextQuestion();
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      // Check we can find the app-loading selector.  It won't be replaced by HTML
      // because of the NO_ERRORS_SCHEMA.
      expect(compiled.querySelector('app-loading')).toBeTruthy();
    });
  });

  it('calling nextQuestion shows the complete page at the end of the check', () => {
    spyOn(mockQuestionService, 'getNextQuestionNumber').and.returnValue(null);
    component.nextQuestion();
    fixture.whenStable().then(() => {
      expect(component.viewState).toBe('complete');
      expect(mockQuestionService.getNextQuestionNumber).toHaveBeenCalledTimes(1);
    });
  });

  describe('manualSubmitHandler', () => {
    it('calls nextQuestion()', () => {
      spyOn(component, 'nextQuestion');
      component.manualSubmitHandler('testinput');
      expect(component.nextQuestion).toHaveBeenCalledTimes(1);
    });
  });

  describe('questionTimeoutHandler()', () => {
    it('calls nextQuestion()', () => {
      spyOn(component, 'nextQuestion');
      component.questionTimeoutHandler('testinput');
      expect(component.nextQuestion).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadingTimeoutHandler', () => {
    it('sets the viewState', () => {
      component.loadingTimeoutHandler();
      expect(component.viewState).toBe('question');
    });
  });
});
