import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { Router } from '@angular/router'
import { StorageService } from '../services/storage/storage.service'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'

import { AAFontsComponent } from './aa-fonts.component'
import { RouteService } from '../services/route/route.service'
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service'
import { SpeechService } from '../services/speech/speech.service'
import { SpeechServiceMock } from '../services/speech/speech.service.mock'
import { AccessArrangementsStorageKey, PupilStorageKey } from '../services/storage/storageKey'

describe('AAFontsComponent', () => {
  let mockRouter
  let mockStorageService
  let mockQuestionService
  let mockPupilPrefsService
  let component: AAFontsComponent
  let fixture: ComponentFixture<AAFontsComponent>

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }
    mockPupilPrefsService = {
      storePupilPrefs: jasmine.createSpy('storePupilPrefs')
    }

    const injector = TestBed.configureTestingModule({
      declarations: [AAFontsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        { provide: SpeechService, useClass: SpeechServiceMock },
        RouteService,
        StorageService
      ]
    })

    mockStorageService = injector.inject(StorageService)
    mockQuestionService = injector.inject(QuestionService)
    mockPupilPrefsService = injector.inject(PupilPrefsService)

    spyOn(mockStorageService, 'getItem').and.callFake((arg) => {
      const pupilStorageKey = new PupilStorageKey()
      const accessArrangementsStorageKey = new AccessArrangementsStorageKey()
      if (arg.toString() === pupilStorageKey.toString()) {
        return { firstName: 'a', lastName: 'b' }
      } else if (arg.toString() === accessArrangementsStorageKey.toString()) {
        return { fontSize: 'regular', contrast: 'bow' }
      }
    })
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AAFontsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should load the component', () => {
    expect(component).toBeTruthy()
  })

  it('should redirect to colour contrast when enabled', fakeAsync(() => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true })
    component.onClick()
    fixture.detectChanges()
    tick()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice'])
  }))

  it('should redirect to the welcome page when colour contrast not enabled', fakeAsync(() => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: false })
    component.onClick()
    fixture.detectChanges()
    tick()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success'])
  }))

  it('should store pupil prefs when navigating away', async () => {
    component.onClick()
    expect(mockPupilPrefsService.storePupilPrefs).toHaveBeenCalledTimes(1)
  })
})
