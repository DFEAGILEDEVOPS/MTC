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

  function detectStateChange(object, method, arg?) {
    const beforeState = component[ 'state' ];
    if (arg) {
      object[ method ]();
    } else {
      object[ method ](arg);
    }
    const afterState = component[ 'state' ];
    expect(beforeState + 1).toBe(afterState);
  }

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      declarations: [ CheckComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],         // we don't need to test sub-components
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
      detectStateChange(component, 'manualSubmitHandler', 'testinput');
    });
  });

  describe('questionTimeoutHandler()', () => {
    it('calls changeState()', () => {
      detectStateChange(component, 'questionTimeoutHandler', 'testinput');
    });
    it('sets the answer if it is a real question', () => {
      const answerService = fixture.debugElement.injector.get(AnswerService);
      spyOn(answerService, 'setAnswer');
      component[ 'isWarmUp' ] = false;
      component.questionTimeoutHandler('123');
      expect(answerService.setAnswer).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadingTimeoutHandler', () => {
    it('increments the state', () => {
      detectStateChange(component, 'loadingTimeoutHandler');
    });
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('cancels all keyboard events and returns false', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      const ev1 = dispatchKeyEvent({ key: '5' });
      expect(ev1.defaultPrevented).toBe(true);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(1);

      // Some browsers map backspace to go back a page.  If the questions times out
      // and the user presses backspace on the loading page, you guessed it, thay go back
      // to the previous page. Well played, Mozilla and Microsoft.
      const ev2 = dispatchKeyEvent({ key: 'Backspace' });
      expect(ev2.defaultPrevented).toBe(true);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2);

      // Ordinary keys should be prevented from doing anything
      const ev3 = dispatchKeyEvent({ key: 'j' });
      expect(ev3.defaultPrevented).toBe(true);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(3);

      // it needs to return false
      expect(component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'x' }))).toBe(false);
    });
  });

  describe('handleTouchEvent', () => {
    function dispatchTouchEvent() {
      const event = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(event);
      return event;
    }

    it('cancels touchend events and returns false', () => {
      spyOn(component, 'handleTouchEndEvent').and.callThrough();
      const ev1 = dispatchTouchEvent();
      expect(ev1.defaultPrevented).toBe(true);
      expect(component.handleTouchEndEvent).toHaveBeenCalledTimes(1);
      expect(component.handleTouchEndEvent(ev1)).toBe(false);
    });
  });

  describe('warmup click handlers', () => {
    it('changes state for warmupIntroClickHandler()', () => {
      detectStateChange(component, 'warmupIntroClickHandler');
    });
    it('changes state for warmupCompleteClickHandler()', () => {
      detectStateChange(component, 'warmupCompleteClickHandler');
    });
  });

  describe('changeState()', () => {
    // This is a private method, but worth testing.
    function testStateChange(stateDesc: string, viewState: string, isWarmUp: boolean) {
      component[ 'allowedStates' ] = [ undefined, stateDesc ];
      component[ 'state' ] = 0;
      component[ 'changeState' ]();
      expect(component[ 'viewState' ]).toBe(viewState);
      expect(component[ 'isWarmUp' ]).toBe(isWarmUp);
    }

    it('shows the warmup-intro when the state is "warmup-intro"', () => {
      testStateChange('warmup-intro', 'warmup-intro', true);
    });
    it('shows the warmup loading screen when the state is "LW<digit>"', () => {
      testStateChange('LW1', 'preload', true);
    });
    it('shows the warmup question when the state is "W<digit>"', () => {
      testStateChange('W1', 'question', true);
    });
    it('shows the warmup complete when the state is "warmup-complete"', () => {
      testStateChange('warmup-complete', 'warmup-complete', true);
    });
    it('shows the loading page when the state is "L<digit>"', () => {
      testStateChange('L1', 'preload', false);
    });
    it('shows the question when the state is "Q<digit>"', () => {
      testStateChange('Q1', 'question', false);
    });
    it('shows the check complete screen when the state is "complete"', () => {
      testStateChange('complete', 'complete', false);
    });
  });
});
