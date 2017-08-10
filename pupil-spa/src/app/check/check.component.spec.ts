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
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('default view should be the loading screen', () => {
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('#js-loading').textContent).toMatch(/Loading question \d of \d/);
    });
  });

  // it('setting the viewState to question shows the question screen', () => {
  //   const compiled = fixture.debugElement.nativeElement;
  //   component.
  //   expect(compiled.querySelector('#js-loading').textContent).toMatch(/Loading question \d of \d/);
  // });

  it('calling nextQuestion shows the next question', () => {
    // const compiled = fixture.debugElement.nativeElement;
    // expect(compiled.querySelector('#js-loading').textContent).toMatch(/Loading question \d of \d/);
    component.nextQuestion();
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      console.log(compiled);
      const el = compiled.querySelector('#js-loading');
      if (!el) {
        expect('Element').toBe('not matched');
      }
      expect(el.textContent).toMatch(/Loading question 3 of \d/);
    });
  });
});
