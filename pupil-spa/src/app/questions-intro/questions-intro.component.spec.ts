import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AppUsageService } from '../services/app-usage/app-usage.service';
import { AuditEntry, CheckStarted, QuestionIntroRendered } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { QuestionsIntroComponent } from './questions-intro.component';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { TokenService } from '../services/token/token.service';

describe('QuestionsIntroComponent', () => {
  let addEntrySpy;
  let auditEntryInserted: AuditEntry;
  let auditService;
  let component: QuestionsIntroComponent;
  let fixture: ComponentFixture<QuestionsIntroComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    const inject = TestBed.configureTestingModule({
      declarations: [ QuestionsIntroComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock},
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: QUEUE_STORAGE_TOKEN },
        AzureQueueService,
        TokenService,
        StorageService,
        AppUsageService
      ]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    inject.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsIntroComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
    addEntrySpy = spyOn(auditService, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onClick()', () => {
    describe('calls check start submit', () => {
      it('send an event top the audit log', async (async() => {
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        await component.onClick();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(auditEntryInserted instanceof CheckStarted).toBeTruthy();
        });
      }));
    });
  });

  describe('audit entry', () => {
    it('is added on WarmupComplete rendered', () => {
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionIntroRendered).toBeTruthy();
    });
  });
});
