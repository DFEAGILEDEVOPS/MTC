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
import { WindowRefService } from '../services/window-ref/window-ref.service'

describe('QuestionsIntroComponent', () => {
  let component: QuestionsIntroComponent;
  let fixture: ComponentFixture<QuestionsIntroComponent>;
  let auditEntryInserted: AuditEntry;
  let auditService;
  let checkStartService;
  let mockWindowRefService;

  beforeEach(waitForAsync(() => {
    mockWindowRefService = { nativeWindow: { location: { assign: jasmine.createSpy('assign') } } }
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
        { provide: WindowRefService, useValue: mockWindowRefService },
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
        spyOn(checkStartService, 'acknowledge').and.resolveTo();
        spyOn(checkStartService, 'submit');
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        await component.onClick();
        expect(auditEntryInserted instanceof CheckStarted).toBeTruthy();
        expect(checkStartService.acknowledge).toHaveBeenCalledTimes(1);
        expect(checkStartService.submit).toHaveBeenCalledTimes(1);
      }));
    });

    it('does not start while acknowledgement is pending and ignores double clicks', async () => {
      let resolveStart: () => void
      spyOn(checkStartService, 'acknowledge').and.returnValue(new Promise<void>(resolve => { resolveStart = resolve }))
      spyOn(checkStartService, 'submit')
      spyOn(component.clickEvent, 'emit')

      const start = component.onClick()
      await component.onClick()
      expect(component.clickEvent.emit).not.toHaveBeenCalled()
      expect(checkStartService.acknowledge).toHaveBeenCalledTimes(1)
      resolveStart()
      await start
      expect(component.clickEvent.emit).toHaveBeenCalledTimes(1)
    })

    it('redirects without starting when the switch blocks the start', async () => {
      spyOn(checkStartService, 'acknowledge').and.rejectWith({
        status: 503,
        error: { code: 'EMERGENCY_OFF_SWITCH_ENABLED' }
      })
      spyOn(checkStartService, 'submit')
      spyOn(component.clickEvent, 'emit')
      spyOn(component.emergencyEvent, 'emit')

      await component.onClick()

      expect(mockWindowRefService.nativeWindow.location.assign).toHaveBeenCalledWith(
        'http://localhost:3001/emergency-off-switch-service-unavailable'
      )
      expect(component.clickEvent.emit).not.toHaveBeenCalled()
      expect(component.emergencyEvent.emit).toHaveBeenCalledTimes(1)
      expect(checkStartService.submit).not.toHaveBeenCalled()
    })

    it('allows retry with the same attempt when acknowledgement fails', async () => {
      spyOn(console, 'error')
      const acknowledge = spyOn(checkStartService, 'acknowledge')
      acknowledge.and.returnValues(Promise.reject(new Error('network error')), Promise.resolve())
      spyOn(checkStartService, 'submit')
      spyOn(component.clickEvent, 'emit')

      await component.onClick()
      expect(component.startFailed).toBeTrue()
      expect(component.clickEvent.emit).not.toHaveBeenCalled()
      await component.onClick()
      expect(acknowledge.calls.argsFor(0)).toEqual(acknowledge.calls.argsFor(1))
      expect(component.clickEvent.emit).toHaveBeenCalledTimes(1)
    })
  });

  describe('audit entry', () => {
    it('is added on WarmupComplete rendered', () => {
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionIntroRendered).toBeTruthy();
    });
  });
});
