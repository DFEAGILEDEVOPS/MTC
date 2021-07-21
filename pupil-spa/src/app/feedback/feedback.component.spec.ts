import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { StorageService } from '../services/storage/storage.service';
import { FeedbackService, IFeedbackService } from '../services/feedback/feedback.service'
import { TokenService } from '../services/token/token.service';
import * as responseMock from '../feedback.response.mock.json';
import { FeedbackComponent } from './feedback.component';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { FeedbackServiceMock } from '../services/feedback/feedback.service.mock'

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  const store = {};
  let mockRouter;
  let feedbackServiceMock: FeedbackServiceMock;

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    feedbackServiceMock = new FeedbackServiceMock();
    jasmine.createSpyObj(['postFeedback'], feedbackServiceMock);

    const injector = TestBed.configureTestingModule({
      declarations: [ FeedbackComponent ],
      imports: [],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: QUEUE_STORAGE_TOKEN, useValue: undefined },
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
    });
    const storageService = injector.get(StorageService);
    const feedbackService = injector.get(FeedbackService);
    injector.compileComponents();

    spyOn(storageService, 'getFeedback').and.callFake(function (key) {
      return JSON.stringify(responseMock);
    });
    spyOn(storageService, 'setFeedback').and.callFake(function (key, value) {
      return store[key] = value + '';
    });
    spyOn(feedbackService, 'postFeedback').and.callFake(function() {
      return true;
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'onSelectionChange').and.callFake(function (key, value) {
    });
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should include a H1 header title', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.page-header h1').textContent).toMatch(/Give feedback/);
  });

  it('should include three questions', () => {
    const compiled = fixture.debugElement.nativeElement;
    const questions = compiled.querySelectorAll('h2.heading-medium');
    expect(questions[0].textContent).toMatch(/How did you enter your answers today?/);
    expect(questions[1].textContent).toMatch(/How easy or difficult was it to enter your answers today?/);
    expect(questions[2].textContent).toMatch(/What would make it better?/);
  });

  it('should include 4 optional answers for InputType field', () => {
    const compiled = fixture.debugElement.nativeElement;
    const inputTypeAnswers = compiled.querySelectorAll('input[name=inputType]');
    for (let i = 1; i <= 4; i++) {
      expect(inputTypeAnswers[i - 1].value).toEqual(i.toString());
    }
  });

  it('should include 5 optional answers for satisfactionRating field', () => {
    const compiled = fixture.debugElement.nativeElement;
    const satisfactionRatingAnswers = compiled.querySelectorAll('input[name=satisfactionRating]');
    for (let i = 1; i <= 5; i++) {
      expect(satisfactionRatingAnswers[i - 1].value).toEqual(i.toString());
    }
  });

  it('should include a textarea for commentText field', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('textarea[name=commentText')).toBeDefined();
  });

  it('should include a submit button', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('input[type=submit]')).toBeDefined();
  });

  it('should initially the submit button be disabled', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('input[type=submit]').disabled).toBe(true);
  });

  it('should onSelectionChange be called when clicking inputType radio button', () => {
    const compiled = fixture.debugElement.nativeElement;
    compiled.querySelector('input[id=input-type-1]').click();
    fixture.whenStable().then(() => {
      expect(component.onSelectionChange).toHaveBeenCalledWith('inputType', {id: 1, value: 'Touchscreen'});
    });
  });

  it('should onSelectionChange be called when clicking satisfactionRate radio button', () => {
    const compiled = fixture.debugElement.nativeElement;
    compiled.querySelector('input[id=satisfaction-rating-2]').click();
    fixture.whenStable().then(() => {
      expect(component.onSelectionChange).toHaveBeenCalledWith('satisfactionRating', {id: 2, value: 'Easy'});
    });
  });

  it('should onSubmit be called when clicking button and there are no errors', () => {
    component['errorInputType'] = false;
    component['errorSatisfactionRating'] = false;

    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    compiled.querySelector('input[type=submit]').click();
    fixture.whenStable().then(() => {
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
      expect(feedbackServiceMock.postFeedback).toHaveBeenCalledTimes(1);
    });
  });

  xit('should onSubmit NOT be called when clicking button and there are errors', () => {
    component['errorInputType'] = true;
    component['errorSatisfactionRating'] = true;
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    compiled.querySelector('input[type=submit]').click();
    fixture.whenStable().then(() => {
      expect(component.onSubmit).not.toHaveBeenCalled();
    });
  });
});
