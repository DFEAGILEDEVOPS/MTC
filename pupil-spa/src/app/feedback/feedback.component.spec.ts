import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AzureQueueService } from '../services/azure-queue/azure-queue.service'
import { CheckStatusService } from '../services/check-status/check-status.service'
import { StorageService } from '../services/storage/storage.service'
import { FeedbackService } from '../services/feedback/feedback.service'
import { TokenService } from '../services/token/token.service'
import { FeedbackComponent } from './feedback.component'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'
import { SpeechService } from '../services/speech/speech.service'
import { SpeechServiceMock } from '../services/speech/speech.service.mock'
import { WindowRefService } from '../services/window-ref/window-ref.service'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { FeedbackServiceMock } from '../services/feedback/feedback.service.mock'

describe('FeedbackComponent', () => {
  let component: FeedbackComponent
  let fixture: ComponentFixture<FeedbackComponent>
  let mockRouter
  let feedbackServiceMock: FeedbackServiceMock
  let feedbackServiceSpy: jasmine.Spy
  let checkStatusService: CheckStatusService

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }
    feedbackServiceMock = new FeedbackServiceMock()
    feedbackServiceSpy = spyOn(feedbackServiceMock, 'postFeedback').and.returnValue(Promise.resolve(true))

    const injector = TestBed.configureTestingModule({
      declarations: [FeedbackComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA], // we don't need to test sub-components
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        WindowRefService,
        AzureQueueService,
        { provide: FeedbackService, useValue: feedbackServiceMock },
        StorageService,
        TokenService,
        CheckStatusService
      ]
    })
    const storageService = injector.inject(StorageService)
    checkStatusService = injector.inject(CheckStatusService)
    injector.compileComponents()
    // We need to return null when check for existing feedback in `componentValidate()` so the component does not navigate away
    spyOn(storageService, 'getFeedback').and.returnValue(null)
    spyOn(storageService, 'setFeedback').and.callFake(function (feedbackData) {}) // eslint-disable-line @typescript-eslint/no-unused-vars
    spyOn(storageService, 'getPupil').and.returnValue({ checkCode: '0000-0000-0000-0000'})
    spyOn(checkStatusService, 'hasFinishedCheck').and.returnValue(true)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    spyOn(component, 'onSelectionChange').and.callFake(() => {})
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })

  it('should include a H1 header title', () => {
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('.page-header h1').textContent).toMatch(/Give feedback/)
  })

  it('should include one question', () => {
    const compiled = fixture.debugElement.nativeElement
    const questions = compiled.querySelectorAll('h2.heading-medium')
    expect(questions[0].textContent).toMatch(/How did you find the multiplication tables check?/)
  })

  it('should include 5 optional answers for satisfactionRating field', () => {
    const compiled = fixture.debugElement.nativeElement
    const satisfactionRatingAnswers = compiled.querySelectorAll('input[name=satisfactionRating]')
    for (let i = 1; i <= 5; i++) {
      expect(satisfactionRatingAnswers[i - 1].value).toEqual(i.toString())
    }
  })

  it('should include a submit button', () => {
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('input[type=submit]')).toBeDefined()
  })

  it('should initially the submit button be disabled', () => {
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('input[type=submit]').disabled).toBe(true)
  })

  it('should onSelectionChange be called when clicking satisfactionRate radio button', fakeAsync(() => {
    const compiled = fixture.debugElement.nativeElement
    compiled.querySelector('input[id=satisfaction-rating-2]').click()
    tick()
    expect(component.onSelectionChange).toHaveBeenCalledWith('satisfactionRating', { id: 2, value: 'Easy' })
  }))

  it('should submit feedback onSubmit when there are no errors', () => {
    component.selectedSatisfactionRating = 'bar'
    component['enableSubmit'] = true
    component.onSubmit()
    expect(feedbackServiceSpy).toHaveBeenCalledTimes(1)
  })

  it('should onSubmit NOT be called when clicking button and there are errors', () => {
    component.selectedSatisfactionRating = undefined
    component.enableSubmit = true
    component.onSubmit()
    expect(feedbackServiceSpy).not.toHaveBeenCalled()
  })
})
