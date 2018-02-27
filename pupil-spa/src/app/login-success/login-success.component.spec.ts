import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DeviceService } from '../services/device/device.service';
import { LoginSuccessComponent } from './login-success.component';
import * as responseMock from '../login.response.mock.json';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;
  let store: {};
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [LoginSuccessComponent],
      providers: [
        DeviceService,
        { provide: Router, useValue: mockRouter },
        StorageService,
        WindowRefService
      ]
    });
    const storageService = injector.get(StorageService);
    injector.compileComponents();

    spyOn(storageService, 'getItem').and.callFake(function (key) {
      return JSON.stringify(responseMock);
    });
    spyOn(storageService, 'setItem').and.callFake(function (key, value) {
      return store[key] = value + '';
    });
    spyOn(storageService, 'clear').and.callFake(function () {
      store = {};
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('asks the user to confirm their details', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('p.lede').textContent).toMatch(/Check your details are correct/);
  });

  it('redirects to warm up introduction page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
  });

});
