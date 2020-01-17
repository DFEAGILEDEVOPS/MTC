import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { AAColoursComponent } from './aa-colours.component';
import { StorageService } from '../services/storage/storage.service';
import { RouteService } from '../services/route/route.service';
import { RouteServiceMock } from '../services/route/route.service.mock';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { QuestionService } from '../services/question/question.service';

describe('AAColoursComponent', () => {
  let mockRouter;
  let mockRouteService;
  let mockPupilPrefsService;
  let mockStorageService;
  let component: AAColoursComponent;
  let fixture: ComponentFixture<AAColoursComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    mockPupilPrefsService = {
      storePupilPrefs: jasmine.createSpy('storePupilPrefs')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ AAColoursComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: RouteService, useClass: RouteServiceMock },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        StorageService,
      ]
    });

    mockRouteService = injector.get(RouteService);
    mockPupilPrefsService = injector.get(PupilPrefsService);
    mockStorageService = injector.get(StorageService);

    spyOn(mockStorageService, 'getItem').and.returnValue({ fontSize: 'regular', contrast: 'bow' });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AAColoursComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should load the component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the access-settings page on click if the user has navigated from access-settings', () => {
    spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/access-settings');
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
    });
  });

  it('should redirect to the sign-in-success page on click if the user has not navigated from access-settings', () => {
    spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
    });
  });

  it('should redirect to the sign-in-success page on click if previous url is undefined', () => {
    spyOn(mockRouteService, 'getPreviousUrl').and.returnValue(undefined);
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
