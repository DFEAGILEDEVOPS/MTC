import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ]
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

  it('should have a Skip link', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('a.skiplink').textContent).toMatch(
    /Skip to main content/
    );
  });

  it('should have a text about Cookies', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#global-cookie-message p').textContent).toMatch(
        /GOV.UK uses cookies to make the site simpler/
    );
  });

  it('should have a link to cookies disclaimer', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#global-cookie-message p a').textContent).toMatch(
      /Find out more about cookies/
    );
  });

  it('should have a link to cookies disclaimer text', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#global-cookie-message p a').textContent).toMatch(
      /Find out more about cookies/
    );
  });

  it('should have a link that takes to external website', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#global-cookie-message p a').href).toMatch(
      'https://www.gov.uk/help/cookies'
    );
  });

  it('should have text next to the logo', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.header-logo').textContent).toMatch(
      /GOV.UK/
    );
  });

  it('should have a title as a link', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('a#proposition-name').textContent).toMatch(
      /Multiplication Tables Check/
    );
  });
});
