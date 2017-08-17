import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionComponent } from './question.component';
import { AuditService } from "../audit.service";
import { AuditServiceMock } from "../audit.service.mock";
import { QuestionRendered, QuestionAnswered, AuditEntry } from "../auditEntry";

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  let auditServiceMock = new AuditServiceMock();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionComponent],
      providers: [
        { provide: AuditService, useValue: auditServiceMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // prevent Timeout's being set
    spyOn(component, 'ngAfterViewInit').and.returnValue(null);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('answerIsLongEnoughToManuallySubmit', () => {
    it('returns true for a proper answer', () => {
      component.answer = 'test';
      expect(component.answerIsLongEnoughToManuallySubmit()).toBeTruthy();
    });
    it('returns false for an empty answer', () => {
      component.answer = '';
      expect(component.answerIsLongEnoughToManuallySubmit()).toBeFalsy();
    });
  });

  describe('onClickAnswer', () => {
    it('adds the input to the answer if there is room', () => {
      component.answer = '12';
      component.onClickAnswer(4);
      expect(component.answer).toBe('124');
    });
    it('does not add the input to the answer if the answer is 5 chars long', () => {
      component.answer = '12345';
      component.onClickAnswer(6);
      expect(component.answer).toBe('12345');
    });
  });

  describe('onClickBackspace', () => {
    it('deletes the end character from the answer', () => {
      component.answer = '12345';
      component.onClickBackspace();
      expect(component.answer).toBe('1234');
    });
    it('behaves when the answer is empty', () => {
      component.answer = '';
      component.onClickBackspace();
      expect(component.answer).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('emits the answer', async(() => {
      component.answer = '123';
      component.manualSubmitEvent.subscribe(g => {
        expect(g).toEqual('123');
      });
      component.onSubmit();
    }));
    it('only allows submit to happen once', async(() => {
      component.answer = '124';
      component.onSubmit(); // burn the submit
      expect(component.onSubmit()).toBeFalsy();  // test repeat submission fails
    }));
    it('returns false if the answer is too short', async(() => {
      component.answer = '';
      expect(component.onSubmit()).toBeFalsy();
    }));
  });

  describe('sendTimeoutEvent', () => {
    it('emits the answer', async(() => {
      component.answer = '125';
      component.manualSubmitEvent.subscribe(g => {
        expect(g).toEqual('125');
      });
      component.sendTimeoutEvent();
    }));
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('adds to the answer when a number is given', () => {
      spyOn(component, 'handleKeyboardEvent');
      const event1 = dispatchKeyEvent({ key: '1', keyCode: 49 });
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(1);
      expect(component.handleKeyboardEvent).toHaveBeenCalledWith(event1);
      // expect(component.answer).toBe('1');
    });
  });

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    beforeEach(() => {
      let auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is added on question rendered', async(() => {
      fixture.whenRenderingDone().then(() => {
        component.ngAfterViewInit();
        expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
        expect(auditEntryInserted instanceof QuestionRendered).toBeTruthy();
      });
    }));

    it('is added on answer submitted', async(() => {
      fixture.whenRenderingDone().then(() => {
        spyOn(component,'answerIsLongEnoughToManuallySubmit').and.returnValue(true);
        component.onSubmit();
        expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
        expect(auditEntryInserted instanceof QuestionAnswered).toBeTruthy();
      });
    }));
  });

});
