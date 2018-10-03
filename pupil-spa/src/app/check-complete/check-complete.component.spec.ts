import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckCompleteComponent } from './check-complete.component';

import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { Router } from '@angular/router';
import { CheckComponent } from '../check/check.component';

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;
  let mockRouter;
  let storageService;

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
        { provide: Router, useValue: mockRouter },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
    storageService = fixture.debugElement.injector.get(StorageService);
    spyOn(storageService, 'removeItem').and.callThrough();
    spyOn(storageService, 'setItem').and.callThrough();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('onClickStartAgain', () => {
    it('should clear the storageService state and redirect to the check start page', async () => {
      component.onStartAgainClick();
      expect(storageService.removeItem).toHaveBeenCalledWith(CheckComponent.checkStateKey);
      expect(storageService.getItem(CheckComponent.checkStateKey)).not.toBeDefined();
      expect(storageService.setItem).toHaveBeenCalledWith('completed_submission', false);
      expect(storageService.getItem('completed_submission')).toBeFalsy(); 
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/check-start']);
    });
  });
});
