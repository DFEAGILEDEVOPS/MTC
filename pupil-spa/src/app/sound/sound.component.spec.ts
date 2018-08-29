import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundComponent } from './sound.component';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

describe('SoundComponent', () => {
  let component: SoundComponent;
  let fixture: ComponentFixture<SoundComponent>;
  let mockQuestionService: QuestionServiceMock;

  beforeEach(async(() => {
    mockQuestionService = new QuestionServiceMock();
    TestBed.configureTestingModule({
      declarations: [ SoundComponent ],
      providers: [
        {provide: QuestionService, useValue: mockQuestionService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has a function to play the end of question sound', () => {
    expect(typeof component.playEndOfQuestionSound).toBe('function');
  });

  it('has a function to play an alert that the time is nearly up', () => {
    expect(typeof component.playTimeRunningOutAlertSound).toBe('function');
  });

  it('should have two audio elements', () => {
    const el: HTMLElement = fixture.nativeElement;
    const audioElements = el.querySelectorAll('audio');
    expect(audioElements.length).toBe(2);
  });
});
