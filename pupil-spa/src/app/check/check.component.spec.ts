import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CheckComponent } from './check.component';
import { QuestionService } from '../question.service';
import { Question } from '../question.model';
import { Config } from '../config.model';

let mockQuestionService;

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;

  beforeEach(async(() => {
    mockQuestionService = {
      getNumberOfQuestions() {
        return 10;
      },
      getQuestion() {
        return new Question(3, 4, 1);
      },
      getNextQuestionNumber() {
        return 2;
      },
      getConfig() {
        const config = new Config();
        config.loadingTime = 2;
        config.questionTime = 5;
        return config;
      }
    };
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
