import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CheckComponent } from './check.component';
import { QuestionService } from '../question.service';
import { QuestionServiceMock } from '../question.service.mock';

let mockQuestionService = new QuestionServiceMock();

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ CheckComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],         // we don't need to test sub-components
      providers: [
        { provide: QuestionService, useValue: mockQuestionService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngDoCheck').and.returnValue('');
    fixture.detectChanges()
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('default view should be the loading screen', () => {
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('app-loading')).toBeTruthy();
    });
  });

  xit('setting the viewState to question shows the question screen', () => {
    const compiled = fixture.debugElement.nativeElement;
    // TODO: set viewState here.
    expect(compiled.querySelector('app-question')).toBeTruthy();
  });

  it('calling nextQuestion shows the next question', () => {
    component.nextQuestion();
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      // Check we can find the app-loading selector.  It won't be replaced by HTML
      // because of the NO_ERRORS_SCHEMA.
      expect(compiled.querySelector('app-loading')).toBeTruthy();
      expect(component.ngDoCheck).toHaveBeenCalledTimes(1);
    });
  });
});
