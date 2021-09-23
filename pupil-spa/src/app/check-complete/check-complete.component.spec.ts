import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CheckCompleteComponent } from './check-complete.component';

import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;
  let mockRouter;
  let storageService;
  let removeCheckStateSpy;
  let removeTimeoutSpy;
  let removeCheckStartTimeSpy;
  let setCompletedSubmission;

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    TestBed.configureTestingModule({
      declarations: [ CheckCompleteComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        WindowRefService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: Router, useValue: mockRouter },
        StorageService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
    storageService = fixture.debugElement.injector.get(StorageService);
    removeCheckStateSpy = spyOn(storageService, 'removeCheckState').and.callThrough();
    removeTimeoutSpy = spyOn(storageService, 'removeTimeout').and.callThrough();
    removeCheckStartTimeSpy = spyOn(storageService, 'removeCheckStartTime').and.callThrough();
    setCompletedSubmission = spyOn(storageService, 'setCompletedSubmission').and.callThrough();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('onClickStartAgain', () => {
    it('should clear the storageService state and redirect to the check start page', async () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'preventDefault');
      storageService.setCheckState(1);
      expect(storageService.getCheckState()).toBe(1);
      component.onStartAgainClick(mockEvent);
      expect(removeCheckStateSpy.calls.count()).toEqual(1);
      expect(removeTimeoutSpy.calls.count()).toEqual(1);
      expect(removeCheckStartTimeSpy.calls.count()).toEqual(1);
      expect(storageService.getCheckState()).toBeNull();
      expect(setCompletedSubmission.calls.allArgs()[0].toString()).toEqual('false');
      expect(storageService.getCompletedSubmission()).toBeFalsy();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/check-start']);
    });
  });
});
