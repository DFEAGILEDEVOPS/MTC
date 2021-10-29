import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing'

import { ErrorLocalstorageComponent } from './error-localstorage.component'
import { Router } from '@angular/router'
import { DeviceService } from '../services/device/device.service'

describe('ErrorLocalstorageComponent', () => {
  let component: ErrorLocalstorageComponent
  let fixture: ComponentFixture<ErrorLocalstorageComponent>
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
      declarations: [ErrorLocalstorageComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: DeviceService, useValue: mockDeviceService }
      ]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorLocalstorageComponent)
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
