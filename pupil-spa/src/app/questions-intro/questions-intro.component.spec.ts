import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core'

import { QuestionsIntroComponent } from './questions-intro.component';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AuditService } from '../services/audit/audit.service';
import { CheckStartService } from '../services/check-start/check-start.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { AuditEntry, AuditEntryFactory, CheckStarted, QuestionIntroRendered } from '../services/audit/auditEntry'
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { TokenService } from '../services/token/token.service';
import { StorageService } from '../services/storage/storage.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppUsageService } from '../services/app-usage/app-usage.service';
import { loadConfigMockService } from '../services/config/config.service'

describe('QuestionsIntroComponent', () => {
  let component: QuestionsIntroComponent;
  let fixture: ComponentFixture<QuestionsIntroComponent>;
  let auditEntryInserted: AuditEntry;
  let auditService;
  let checkStartService;

  beforeEach(waitForAsync(() => {
    const inject = TestBed.configureTestingModule({
    declarations: [QuestionsIntroComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        AzureQueueService,
        TokenService,
        StorageService,
        CheckStartService,
        CheckStartService,
        AppUsageService,
        AuditEntryFactory,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    TestBed.inject(HttpClient);
    TestBed.inject(HttpTestingController);
    checkStartService = inject.inject(CheckStartService);
    inject.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsIntroComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
    spyOn(auditService, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onClick()', () => {
    describe('calls check start submit', () => {
      it('successfully calls check start service', waitForAsync (async() => {
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
