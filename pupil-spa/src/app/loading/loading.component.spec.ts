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

  describe('handleRefreshPrevention', () => {
    it('should prevent F5 key and call preventDefault', () => {
      const event = new KeyboardEvent('keydown', { key: 'F5' })
      spyOn(event, 'preventDefault')
      spyOn(event, 'stopPropagation')
      
      const result = component.handleRefreshPrevention(event)
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should prevent Ctrl+R and call preventDefault', () => {
      const event = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true })
      spyOn(event, 'preventDefault')
      spyOn(event, 'stopPropagation')
      
      const result = component.handleRefreshPrevention(event)
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should prevent Cmd+R (metaKey without altKey) and call preventDefault', () => {
      const event = new KeyboardEvent('keydown', { key: 'r', metaKey: true, altKey: false })
      spyOn(event, 'preventDefault')
      spyOn(event, 'stopPropagation')
      
      const result = component.handleRefreshPrevention(event)
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should handle case-insensitive R key', () => {
      const eventLowerR = new KeyboardEvent('keydown', { key: 'r', metaKey: true })
      const eventUpperR = new KeyboardEvent('keydown', { key: 'R', metaKey: true })
      spyOn(eventLowerR, 'preventDefault')
      spyOn(eventUpperR, 'preventDefault')
      
      const result1 = component.handleRefreshPrevention(eventLowerR)
      const result2 = component.handleRefreshPrevention(eventUpperR)
      
      expect(eventLowerR.preventDefault).toHaveBeenCalled()
      expect(eventUpperR.preventDefault).toHaveBeenCalled()
      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })

    it('should not prevent non-refresh keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      spyOn(event, 'preventDefault')
      
      const result = component.handleRefreshPrevention(event)
      
      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should not prevent R key without modifier keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'r' })
      spyOn(event, 'preventDefault')
      
      const result = component.handleRefreshPrevention(event)
      
      expect(event.preventDefault).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })
});
