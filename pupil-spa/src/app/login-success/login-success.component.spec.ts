import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSuccessComponent } from './login-success.component';
import * as responseMock from '../login.response.mock.json';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;
  let store: {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginSuccessComponent ]
    })
    .compileComponents();

    spyOn(localStorage, 'getItem').and.callFake(function (key) {
      return JSON.stringify(responseMock);
    });
    spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
      return store[key] = value + '';
    });
    spyOn(localStorage, 'clear').and.callFake(function () {
      store = {};
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
