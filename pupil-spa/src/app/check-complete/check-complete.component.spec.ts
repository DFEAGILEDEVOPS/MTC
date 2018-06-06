import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCompleteComponent } from './check-complete.component';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { AuditService } from '../services/audit/audit.service';

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;
  let storageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckCompleteComponent ],
      providers: [
        { provide: StorageService, useClass: StorageServiceMock },
        WindowRefService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        AuditService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
    component = fixture.componentInstance;
    storageService = fixture.debugElement.injector.get(StorageService);
  });

  it('should be created', () => {
    spyOn(storageService, 'setItem');
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(storageService.setItem).toHaveBeenCalledTimes(2);
  });
});
