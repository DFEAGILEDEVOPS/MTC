import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      providers: [
        { provide: QuestionService, useClass: QuestionServiceMock },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have text next to the logo', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.header-logo').textContent).toMatch(
      /GOV.UK/
    );
  });

  it('should have a title as a link', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#proposition-name').textContent).toMatch(
      /Multiplication Tables Check/
    );
  });
});
