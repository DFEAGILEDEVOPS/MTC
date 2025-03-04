import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { Router } from '@angular/router'
import { QuestionService } from '../services/question/question.service'
import { IStorageService, StorageService } from '../services/storage/storage.service'
import { SpeechService } from '../services/speech/speech.service'
import { SpeechServiceMock } from '../services/speech/speech.service.mock'
import { FormsModule } from '@angular/forms'
import { StorageServiceMock } from '../services/storage/mock-storage.service'
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service'

import { AASettingsComponent } from './aa-settings.component'

describe('AASettingsComponent', () => {
  let mockRouter
  let mockQuestionService
  let mockPupilPrefsService
  let component: AASettingsComponent
  let fixture: ComponentFixture<AASettingsComponent>
  let mockStorageService: IStorageService

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }
    mockQuestionService = jasmine.createSpyObj('QuestionService', ['getConfig'])
    mockStorageService = new StorageServiceMock()
    mockPupilPrefsService = {
      storePupilPrefs: jasmine.createSpy('storePupilPrefs')
    }

    TestBed.configureTestingModule({
      declarations: [AASettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: StorageService, useValue: mockStorageService },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService }
      ],
      imports: [FormsModule]
    })
  }))

  describe('With input assistant disabled', () => {

    beforeEach(() => {
      mockQuestionService.getConfig.and.returnValue({ inputAssistance: false })
      fixture = TestBed.createComponent(AASettingsComponent)
      fixture.detectChanges()
      component = fixture.componentInstance
    })

    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should redirect to warm up introduction page', async () => {
      component.onClick()
      await fixture.whenStable()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start'])
    })
  })

  describe('With input assistant enabled', () => {
    describe('and when check type is live', () => {
      beforeEach(() => {
        mockQuestionService.getConfig.and.returnValue({ inputAssistance: true })
        fixture = TestBed.createComponent(AASettingsComponent)
        fixture.detectChanges()
        component = fixture.componentInstance
      })

      it('should have empty form data', () => {
        expect(component.inputAssistantForm.value.inputAssistantFirstName).toBe(undefined)
        expect(component.inputAssistantForm.value.inputAssistantLastName).toBe(undefined)
      })

      it('should redirect to the sign-in-success page on successful submission', async () => {
        const getPupilSpy = spyOn(mockStorageService, 'getPupil').and.returnValue({ checkCode: 'checkCode', inputAssistant: {} })
        const setPupilSpy = spyOn(mockStorageService, 'setPupil')
        await fixture.whenStable()
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('F1rstNàme')
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('Last-Na\'me')
        const updatedPupilData = {
          checkCode: 'checkCode',
          inputAssistant: {
            firstName: 'F1rstNàme',
            lastName: 'Last-Na\'me'
          }
        }
        component.onClick()
        expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start'])
        expect(getPupilSpy).toHaveBeenCalled()
        expect(setPupilSpy.calls.all()[0].args[0]).toEqual(updatedPupilData)
      })

      it('should call the pupil prefs service to store the input assistant data', async () => {
        spyOn(mockStorageService, 'getPupil').and.returnValue({ checkCode: 'checkCode', inputAssistant: {} })
        await fixture.whenStable()
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('FirstName')
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('LastName')
        component.onClick()
        expect(mockPupilPrefsService.storePupilPrefs).toHaveBeenCalled()
      })

      it('should not redirect to the sign-in-success when a disallowed special character(exclamation) is detected', async () => {
        const getPupilSpy = spyOn(mockStorageService, 'getPupil')
        const setPupilSpy = spyOn(mockStorageService, 'setPupil')
        await fixture.whenStable()
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('First!Name')
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('LastName')
        component.onClick()
        expect(mockRouter.navigate).not.toHaveBeenCalled()
        expect(getPupilSpy).not.toHaveBeenCalled()
        expect(setPupilSpy).not.toHaveBeenCalled()
      })

      it('should not redirect to the sign-in-success when a disallowed special character(double quotes) is detected', async () => {
        const getPupilSpy = spyOn(mockStorageService, 'getPupil')
        const setPupilSpy = spyOn(mockStorageService, 'setPupil')
        await fixture.whenStable()
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('FirstName')
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('Last"Name')
        component.onClick()
        expect(mockRouter.navigate).not.toHaveBeenCalled()
        expect(getPupilSpy).not.toHaveBeenCalled()
        expect(setPupilSpy).not.toHaveBeenCalled()
      })
    })

    describe('and when check type is familiarisation', () => {
      beforeEach(() => {
        mockQuestionService.getConfig.and.returnValue({ inputAssistance: true, practice: true })
        fixture = TestBed.createComponent(AASettingsComponent)
        fixture.detectChanges()
        component = fixture.componentInstance
      })
      it('should not call storageService setPupil method when practice mode is switched on', async () => {
        const getPupilSpy = spyOn(mockStorageService, 'getPupil')
        const setPupilSpy = spyOn(mockStorageService, 'setPupil')
        await fixture.whenStable()
        component.onClick()
        expect(mockRouter.navigate).toHaveBeenCalled()
        expect(getPupilSpy).not.toHaveBeenCalled()
        expect(setPupilSpy).not.toHaveBeenCalled()
      })
    })
  })
})
