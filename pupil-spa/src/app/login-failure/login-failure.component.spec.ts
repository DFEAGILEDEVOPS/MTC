import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFailureComponent } from './login-failure.component';

describe('LoginFailureComponent', () => {
  let component: LoginFailureComponent;
  let fixture: ComponentFixture<LoginFailureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginFailureComponent ]
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
});
