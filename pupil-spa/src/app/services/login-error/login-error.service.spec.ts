import { inject, TestBed } from '@angular/core/testing'

import { LoginErrorService } from './login-error.service'

let loginErrorService


describe('LoginErrorService', () => {
  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        LoginErrorService
      ]
    })
    loginErrorService = injector.inject(LoginErrorService)
  })
  it('should be created', inject([LoginErrorService], (service: LoginErrorService) => {
    expect(service).toBeTruthy()
  }))
  it('should have default observable message value', inject([LoginErrorService], () => {
    const currentMessage = loginErrorService.currentErrorMessage
    currentMessage.subscribe((m) => {
      expect(m).toEqual('')
    })
  }))
  it('changeMessage should provide the new value to the BehaviorSubject', () => {
    const newMessage = 'new message'
    loginErrorService.changeMessage(newMessage)
    const errorMessageObservable = loginErrorService.currentErrorMessage
    errorMessageObservable.subscribe((m) => {
      expect(m).toEqual(newMessage)
    })
  })
})
