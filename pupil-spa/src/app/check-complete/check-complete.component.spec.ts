import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckCompleteComponent } from './check-complete.component';

import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionService } from '../services/question/question.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { Router } from '@angular/router';
import {
  CheckStartTimeStorageKey,
  CheckStateStorageKey,
  CompletedSubmissionStorageKey,
  TimeoutStorageKey
} from '../services/storage/storageKey';

const checkStartTimeStorageKey = new CheckStartTimeStorageKey();
const checkStateStorageKey = new CheckStateStorageKey();
const timeoutStorageKey = new TimeoutStorageKey();
const completedSubmissionStorageKey = new CompletedSubmissionStorageKey();

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;
  let mockRouter;
  let storageService;
  let removeItemSpy;
  let setItemSpy;

  beforeEach(async(() => {
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
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: Router, useValue: mockRouter },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
    storageService = fixture.debugElement.injector.get(StorageService);
    removeItemSpy = spyOn(storageService, 'removeItem').and.callThrough();
    setItemSpy = spyOn(storageService, 'setItem').and.callThrough();
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
      component.onStartAgainClick(mockEvent);
      expect(removeItemSpy.calls.allArgs()[0].toString()).toEqual(checkStateStorageKey.toString());
      expect(removeItemSpy.calls.allArgs()[1].toString()).toEqual(timeoutStorageKey.toString());
      expect(removeItemSpy.calls.allArgs()[2].toString()).toEqual(checkStartTimeStorageKey.toString());
      expect(storageService.getItem(CheckStateStorageKey)).not.toBeDefined();
      expect(setItemSpy.calls.allArgs()[0].toString()).toEqual(`${completedSubmissionStorageKey.toString()},false`);
      expect(storageService.getItem(completedSubmissionStorageKey.toString())).toBeFalsy();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/check-start']);
    });
  });
});
