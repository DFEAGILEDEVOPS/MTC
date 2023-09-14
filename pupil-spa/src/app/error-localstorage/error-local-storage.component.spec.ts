import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { ErrorLocalStorageComponent } from './error-local-storage.component'
import { Router } from '@angular/router'
import { DeviceService } from '../services/device/device.service'

describe('ErrorLocalStorageComponent', () => {
  let component: ErrorLocalStorageComponent
  let fixture: ComponentFixture<ErrorLocalStorageComponent>
  let mockRouter
  let mockDeviceService

  beforeEach(async () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }
    mockDeviceService = {
      isLocalStorageEnabled: () => false
    }
    await TestBed.configureTestingModule({
      declarations: [ErrorLocalStorageComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: DeviceService, useValue: mockDeviceService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorLocalStorageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('checks localstorage after a page refresh and redirects to the sign-in page if local storage is now enabled', fakeAsync(() => {
    spyOn(mockDeviceService, 'isLocalStorageEnabled').and.returnValue(true)
    component.ngOnInit()
    tick(2)
    expect(mockDeviceService.isLocalStorageEnabled).toHaveBeenCalledTimes(1)
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in'])
  }))
})
