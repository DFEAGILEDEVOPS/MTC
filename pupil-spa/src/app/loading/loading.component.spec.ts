import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AuditService } from '../services/audit/audit.service';
import { AuditEntry, PauseRendered } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let auditServiceMock = new AuditServiceMock();

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [LoadingComponent],
      providers: [
        { provide: AuditService, useValue: auditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        StorageService,
        WindowRefService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    auditServiceMock = fixture.debugElement.injector.get(AuditService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should add audit entry when loading rendered', () => {
    let auditEntryInserted: AuditEntry;
    spyOn(auditServiceMock, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    component.ngAfterViewInit();
    expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
    expect(auditEntryInserted instanceof PauseRendered).toBeTruthy();
  });
});
