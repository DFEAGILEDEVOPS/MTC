import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'

import { SubmissionPendingComponent } from './submission-pending.component'
import { CheckCompleteService } from '../services/check-complete/check-complete.service'
import { AuditService } from '../services/audit/audit.service'
import { AuditServiceMock } from '../services/audit/audit.service.mock'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'
import { SpeechService } from '../services/speech/speech.service'
import { SpeechServiceMock } from '../services/speech/speech.service.mock'
import { StorageService } from '../services/storage/storage.service'
import { CheckStatusService } from '../services/check-status/check-status.service'
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock'
import { AzureQueueService, IAzureQueueService } from '../services/azure-queue/azure-queue.service'
import { TokenService } from '../services/token/token.service'
import { APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core'
import { AppUsageService } from '../services/app-usage/app-usage.service'
import { loadConfigMockService } from '../services/config/config.service'
import { SubmissionService } from '../services/submission/submission.service'

describe('SubmissionPendingComponent', () => {
  let fixture: ComponentFixture<SubmissionPendingComponent>
  let checkCompleteService
  let auditService
  let checkStatusService
  let storageService
  let component
  let activatedRoute: ActivatedRoute
  let azureQueueServiceSpy: IAzureQueueService
  let submissionServiceSpy: {
    submit: jasmine.Spy
  }
  beforeEach(waitForAsync(() => {
    azureQueueServiceSpy = {
      addMessageToQueue: jasmine.createSpy('addMessageToQueue')
    }
    submissionServiceSpy = {
      submit: jasmine.createSpy('submit')
    }
    TestBed.configureTestingModule({
      declarations: [SubmissionPendingComponent],
      imports: [RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA], // we don't need to test sub-components
      providers: [
        CheckCompleteService,
        TokenService,
        AppUsageService,
        { provide: AzureQueueService, useValue: azureQueueServiceSpy },
        { provide: SubmissionService, useValue: submissionServiceSpy },
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        StorageService
      ]
    })
      .compileComponents()
    activatedRoute = TestBed.inject(ActivatedRoute)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionPendingComponent)
    component = fixture.componentInstance
    storageService = fixture.debugElement.injector.get(StorageService)
    checkCompleteService = fixture.debugElement.injector.get(CheckCompleteService)
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
  describe('ngOnInit()', () => {
    it('calls check complete submit method', async () => {
      auditService = fixture.debugElement.injector.get(AuditService)
      checkStatusService = fixture.debugElement.injector.get(CheckStatusService)
      spyOn(checkStatusService, 'hasFinishedCheck').and.returnValue(false)
      spyOn(checkCompleteService, 'submit')
      spyOn(auditService, 'addEntry')
      spyOn(storageService, 'setItem')
      await component.ngOnInit()
      expect(checkCompleteService.submit).toHaveBeenCalled()
      expect(component.title).toBe('You have finished')
    })
    it('provides an appropriate title when a previous check is detected though a URL param', async () => {
      auditService = fixture.debugElement.injector.get(AuditService)
      checkStatusService = fixture.debugElement.injector.get(CheckStatusService)
      spyOn(checkStatusService, 'hasFinishedCheck').and.returnValue(false)
      spyOn(checkCompleteService, 'submit')
      activatedRoute.snapshot.queryParams.unfinishedCheck = true
      await component.ngOnInit()
      expect(component.title).toBe('Uploading previous check')
    })
  })
})
