import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import * as responseMock from '../feedback.response.mock.json';
import { FeedbackComponent } from './feedback.component';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  const store = {};
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FeedbackComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
        StorageService
      ]
    });
    const storageService = injector.get(StorageService);
    injector.compileComponents();

    spyOn(storageService, 'getItem').and.callFake(function (key) {
      return JSON.stringify(responseMock);
    });
    spyOn(storageService, 'setItem').and.callFake(function (key, value) {
      return store[key] = value + '';
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'onSelectionChange').and.callFake(function (key, value) {
    });
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should include a H1 header title', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1.heading-xlarge').textContent).toMatch(/Give feedback/);
  });

  it('should include three questions', () => {
    const compiled = fixture.debugElement.nativeElement;
    const questions = compiled.querySelectorAll('h2.heading-medium');
    expect(questions[0].textContent).toMatch(/How did you enter your answers today?/);
    expect(questions[1].textContent).toMatch(/How easy or difficult was it to enter your answers today?/);
    expect(questions[2].textContent).toMatch(/What would make it better?/);
  });

  it('should include 4 optional answers for InputType field', () => {
    const compiled = fixture.debugElement.nativeElement;
    const inputTypeAnswers = compiled.querySelectorAll('input[name=inputType]');
    for (let i = 1; i <= 4; i++) {
      expect(inputTypeAnswers[i - 1].value).toEqual(i.toString());
    }
  });

  it('should include 5 optional answers for satisfactionRating field', () => {
    const compiled = fixture.debugElement.nativeElement;
    const satisfactionRatingAnswers = compiled.querySelectorAll('input[name=satisfactionRating]');
    for (let i = 1; i <= 5; i++) {
      expect(satisfactionRatingAnswers[i - 1].value).toEqual(i.toString());
    }
  });

  it('should include a textarea for commentText field', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('textarea[name=commentText')).toBeDefined();
  });

  it('should include a submit button', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('input[type=submit]')).toBeDefined();
  });

  it('should initially the submit button be disabled', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('input[type=submit]').disabled).toBe(true);
  });

  it('should onSelectionChange be called when clicking inputType radio button', () => {
    const compiled = fixture.debugElement.nativeElement;
    compiled.querySelector('input[id=input-type-1]').click();
    fixture.whenStable().then(() => {
      expect(component.onSelectionChange).toHaveBeenCalledWith('inputType', {id: 1, value: 'Touchscreen'});
    });
  });

  it('should onSelectionChange be called when clicking satisfactionRate radio button', () => {
    const compiled = fixture.debugElement.nativeElement;
    compiled.querySelector('input[id=satisfaction-rating-2]').click();
    fixture.whenStable().then(() => {
      expect(component.onSelectionChange).toHaveBeenCalledWith('satisfactionRating', {id: 2, value: 'Easy'});
    });
  });
});
