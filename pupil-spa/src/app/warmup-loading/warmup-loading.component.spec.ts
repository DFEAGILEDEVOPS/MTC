import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WarmupLoadingComponent } from './warmup-loading.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { AuditEntryFactory } from '../services/audit/auditEntry'


describe('WarmupLoadingComponent', () => {
  let component: WarmupLoadingComponent;
  let fixture: ComponentFixture<WarmupLoadingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmupLoadingComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        AuditEntryFactory
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
