import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WarmupCompleteComponent } from './warmup-complete.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WarmupCompleteRendered, AuditEntry, AuditEntryFactory } from '../services/audit/auditEntry'
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WarmupCompleteComponent', () => {
  let component: WarmupCompleteComponent;
  let fixture: ComponentFixture<WarmupCompleteComponent>;
  let auditEntryInserted: AuditEntry;
  let auditService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmupCompleteComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: AuditService, useClass: AuditServiceMock},
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        AuditEntryFactory
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupCompleteComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
    spyOn(auditService, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    fixture.detectChanges();
  });
  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('emits onClick()', waitForAsync (() => {
    component.clickEvent.subscribe( g => {
      expect(g).toBe(null);
    });
    component.onClick();
  }));

  describe('audit entry', () => {
    it('is added on WarmupComplete rendered', () => {
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupCompleteRendered).toBeTruthy();
    });
  });
});
