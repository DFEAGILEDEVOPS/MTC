import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { UserService } from '../services/user/user.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockUserService;

  beforeEach(waitForAsync(() => {
    mockUserService = {
      isLoggedIn: jasmine.createSpy('isLoggedIn')
    };
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: UserService, useValue: mockUserService }
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
