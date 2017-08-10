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
});
