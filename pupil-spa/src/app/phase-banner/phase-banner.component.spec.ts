import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhaseBannerComponent } from './phase-banner.component';

describe('PhaseBannerComponent', () => {
  let component: PhaseBannerComponent;
  let fixture: ComponentFixture<PhaseBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have text tag', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.phase-banner .phase-tag').textContent).toMatch(
      /BETA/
    );
  });

  it('should have text explanation', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.phase-banner span').textContent).toMatch(
      /This is a new service – your feedback will help us to improve it./
    );
  });

  it('should have link to the feedback page', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.phase-banner span a').textContent).toMatch(
      /feedback/
    );
  });
/* TODO: check feedback link is correct (once we know the path) */
});
