import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BreadcrumbsComponent } from './breadcrumbs.component';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadcrumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render links for crumbs with a url and mark the last crumb as the current page', () => {
    fixture.componentRef.setInput('breadcrumbs', [{ url: '.', name: 'Home' }, { name: 'Contact' }]);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const link = compiled.querySelector('.govuk-breadcrumbs__link');
    expect(link.textContent).toMatch(/Home/);
    expect(link.getAttribute('href')).toBe('/.');
    const current = compiled.querySelector('.govuk-breadcrumbs__list-item[aria-current="page"]');
    expect(current.textContent).toMatch(/Contact/);
  });
});
