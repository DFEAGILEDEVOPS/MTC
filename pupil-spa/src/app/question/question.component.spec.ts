import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { QuestionComponent } from './question.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionRendered, QuestionAnswered, AuditEntry } from '../services/audit/auditEntry';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { SubmissionService } from '../services/submission/submission.service';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';


describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  const auditServiceMock = new AuditServiceMock();
  let registerInputService: RegisterInputService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      declarations: [ QuestionComponent ],
      providers: [
        { provide: AuditService, useValue: auditServiceMock },
        WindowRefService,
        { provide: RegisterInputService, useClass: RegisterInputServiceMock }
      ]
    }).compileComponents().catch(error => { console.error(error); });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    spyOn(component, 'handleTouchEvent').and.callThrough();
    spyOn(component, 'handleMouseEvent').and.callThrough();

    // This is the best way to get the injected service, the way that _always_ _works_
    // https://angular.io/guide/testing#get-injected-services
    registerInputService = fixture.debugElement.injector.get(RegisterInputService);
    spyOn(registerInputService, 'addEntry');

    // Place this last so the spies above are registered.
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('handleMouseEvent', () => {
    function dispatchMouseEvent() {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(event);
    }

    it('tracks mousedown events', () => {
      dispatchMouseEvent();
      expect(component.handleMouseEvent).toHaveBeenCalledTimes(1);
      expect(registerInputService.addEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleTouchEvent', () => {
    function dispatchTouchEvent() {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(event);
    }

    it('tracks touch events', () => {
      dispatchTouchEvent();
      expect(component.handleTouchEvent).toHaveBeenCalledTimes(1);
      expect(registerInputService.addEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    beforeEach(() => {
      const auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is added on question rendered', () => {
      component.ngAfterViewInit();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionRendered).toBeTruthy();
    });

    it('is added on answer submitted', () => {
      component.answer = '42';
      component.onSubmit();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionAnswered).toBeTruthy();
    });
  });

});
