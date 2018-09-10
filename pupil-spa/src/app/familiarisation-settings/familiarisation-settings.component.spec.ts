import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

import { FamiliarisationSettingsComponent } from './familiarisation-settings.component';

describe('FamiliarisationSettingsComponent', () => {
  let mockRouter;
  let mockQuestionService;
  let component: FamiliarisationSettingsComponent;
  let fixture: ComponentFixture<FamiliarisationSettingsComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationSettingsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock }
      ]
    });
    mockQuestionService = injector.get(QuestionService);

    spyOn(mockQuestionService, 'getConfig').and.returnValue({ fontSize: true });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationSettingsComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the sign-in-success page on click', () => {
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
    });
  });
});
