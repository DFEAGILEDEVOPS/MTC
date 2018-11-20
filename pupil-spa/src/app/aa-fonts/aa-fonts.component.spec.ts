import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

import { AAFontsComponent } from './aa-fonts.component';
import { RouteService } from '../services/route/route.service';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';

describe('AAFontsComponent', () => {
  let mockRouter;
  let mockStorageService;
  let mockQuestionService;
  let mockPupilPrefsService;
  let component: AAFontsComponent;
  let fixture: ComponentFixture<AAFontsComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    mockPupilPrefsService = {
      storePupilPrefs: jasmine.createSpy('storePupilPrefs'),
      loadPupilPrefs: jasmine.createSpy('loadPupilPrefs')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ AAFontsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        RouteService
      ]
    });

    mockStorageService = injector.get(StorageService);
    mockQuestionService = injector.get(QuestionService);
    mockPupilPrefsService = injector.get(PupilPrefsService);

    spyOn(mockStorageService, 'getItem').and.callFake((arg) => {
      if (arg === 'pupil') {
        return { firstName: 'a', lastName: 'b' };
      } else if (arg === 'access_arrangements') {
        return { fontSize: 'regular', contrast: 'bow' };
      }
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AAFontsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the component', () => {
    expect(component).toBeTruthy();
    expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
  });

  it('should redirect to colour contrast when enabled', () => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true });
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice']);
    });
  });

  it('should redirect to the welcome page when colour contrast not enabled', () => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: false });
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
    });
  });

  it('should store pupil prefs when navigating away', async () => {
    component.onClick();
    expect(mockPupilPrefsService.storePupilPrefs).toHaveBeenCalledTimes(1);
  });
});
