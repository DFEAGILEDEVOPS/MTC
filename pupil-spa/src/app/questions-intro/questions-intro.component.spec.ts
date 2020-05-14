import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { QuestionsIntroComponent } from './questions-intro.component';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AuditService } from '../services/audit/audit.service';
import { CheckStartService } from '../services/check-start/check-start.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { AuditEntry, CheckStarted, QuestionIntroRendered } from '../services/audit/auditEntry';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { TokenService } from '../services/token/token.service';
import { StorageService } from '../services/storage/storage.service';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppUsageService } from '../services/app-usage/app-usage.service';

describe('QuestionsIntroComponent', () => {
  let component: QuestionsIntroComponent;
  let fixture: ComponentFixture<QuestionsIntroComponent>;
  let auditEntryInserted: AuditEntry;
  let auditService;
  let checkStartService;
  let addEntrySpy;
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
        { provide: QUEUE_STORAGE_TOKEN, useValue: undefined },
        AzureQueueService,
        TokenService,
        StorageService,
        CheckStartService,
        CheckStartService,
        AppUsageService
      ]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    checkStartService = inject.get(CheckStartService);
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
      it('successfully calls check start service', async (async() => {
        checkStartService = fixture.debugElement.injector.get(CheckStartService);
        spyOn(checkStartService, 'submit');
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        await component.onClick();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(auditEntryInserted instanceof CheckStarted).toBeTruthy();
        });
        expect(checkStartService.submit).toHaveBeenCalledTimes(1);
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
