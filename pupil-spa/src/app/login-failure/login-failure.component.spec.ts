import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFailureComponent } from './login-failure.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginFailureComponent', () => {
  let component: LoginFailureComponent;
  let fixture: ComponentFixture<LoginFailureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginFailureComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should tell the user whats wrong', () => {
    const compiled = fixture.debugElement.nativeElement;
    const s = 'The details entered do not match our records. Please check with your teacher that you used ' +
      'the correct school password and pupil PIN';
    expect(compiled.querySelector('p.lede').textContent).toMatch(/s/);
  });
});
