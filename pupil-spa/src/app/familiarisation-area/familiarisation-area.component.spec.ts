import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

import { FamiliarisationAreaComponent } from './familiarisation-area.component';

describe('FamiliarisationAreaComponent', () => {
  let mockRouter;
  let mockStorageService;
  let mockQuestionService;
  let component: FamiliarisationAreaComponent;
  let fixture: ComponentFixture<FamiliarisationAreaComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationAreaComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock }
      ]
    });

    mockStorageService = injector.get(StorageService);
    mockQuestionService = injector.get(QuestionService);

    spyOn(mockStorageService, 'getItem').and.returnValue({ firstName: 'a', lastName: 'b' });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to colour contrast when enabled', () => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true });
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice']);
    });
  });

  it('should redirect to the settings page when colour contrast not enabled', () => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: false });
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
    });
  });
});
