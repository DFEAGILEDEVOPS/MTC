import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AuditService } from '../services/audit/audit.service';
import { AuditEntry, AuditEntryFactory, PauseRendered } from '../services/audit/auditEntry'
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { Question } from '../services/question/question.model';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { IdleModalComponent } from '../modal/idle.modal.component';
import { TimerService } from '../services/timer/timer.service';
import { TimerServiceMock } from '../services/timer/timer.service.mock';
import { SvgClockComponent } from '../svg/svg.clock.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let auditServiceMock = new AuditServiceMock();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingComponent, IdleModalComponent, SvgClockComponent],
      providers: [
        { provide: TimerService, useClass: TimerServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        StorageService,
        WindowRefService,
        AuditEntryFactory
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
    component.question = new Question(2, 3, 1);
    component.ngAfterViewInit();
    expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
    expect(auditEntryInserted instanceof PauseRendered).toBeTruthy();
    expect((<any> auditEntryInserted.data).sequenceNumber).toBe(1);
    expect((<any> auditEntryInserted.data).question).toBe('2x3');
  });

  it('should clean up the timeouts when destroyed', async () => {
    // @ts-expect-error: spying on protected method
    const spy = spyOn(component, 'cleanupTheTimeouts').and.callThrough()
    await component.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
  })
});
