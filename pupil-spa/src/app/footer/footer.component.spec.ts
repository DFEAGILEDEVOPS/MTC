import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {utf8Encode} from "@angular/compiler/src/util";

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have link with text', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.copyright a').textContent).toMatch(
      /© Crown copyright/
    );
  });

  it('should have link to external copyright information', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.copyright a').href).toMatch(
      'http://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/copyright-and-re-use/crown-copyright/'
    );
  });
});
