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

  it('should link the GOV.UK logo to GOV.UK', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.header-logo').getAttribute('href')).toBe('https://www.gov.uk');
  });

  it('should link the service name to the sign in page', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#proposition-name').getAttribute('routerLink')).toBe('/sign-in');
  });

  it('should show the try it out banner only for the familiarisation check', () => {
    expect(fixture.debugElement.nativeElement.querySelector('#familiarisation-header-bar')).toBeNull();
    mockUserService.isLoggedIn.and.returnValue(true);
    spyOn(TestBed.inject(QuestionService), 'getConfig').and.returnValue({ practice: true } as any);
    const practiceFixture = TestBed.createComponent(HeaderComponent);
    practiceFixture.detectChanges();
    const banner = practiceFixture.debugElement.nativeElement.querySelector('#familiarisation-header-bar');
    expect(banner.querySelector('.govuk-tag').textContent).toMatch(/Try it out/);
  });
});
