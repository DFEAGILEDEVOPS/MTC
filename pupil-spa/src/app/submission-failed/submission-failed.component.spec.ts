import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionFailedComponent } from './submission-failed.component';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SubmissionFailedComponent', () => {
  let component: SubmissionFailedComponent;
  let fixture: ComponentFixture<SubmissionFailedComponent>;
  let auditService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionFailedComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionFailedComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
  });

  it('should be created', () => {
    spyOn(auditService, 'addEntry');
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(auditService.addEntry).toHaveBeenCalledTimes(1);
  });
});
