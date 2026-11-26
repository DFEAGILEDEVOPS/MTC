import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';

import { AuditEntryFactory } from '../services/audit/auditEntry'
import { AuditService } from '../services/audit/audit.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { CheckStartService } from '../services/check-start/check-start.service';
import { MonotonicTimeService } from '../services/monotonic-time/monotonic-time.service'
import { APP_CONFIG } from '../services/config/config.service'
import { WindowRefService } from '../services/window-ref/window-ref.service'
import { v4 as uuidv4 } from 'uuid'

@Component({
    selector: 'app-questions-intro',
    templateUrl: './questions-intro.component.html',
    styleUrls: ['./questions-intro.component.scss'],
    standalone: false
})
export class QuestionsIntroComponent implements AfterViewInit, OnDestroy {

  private speechListenerEvent: any;

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  emergencyEvent: EventEmitter<void> = new EventEmitter();

  public count: number;
  public startPending = false;
  public startFailed = false;
  private readonly attemptId = uuidv4();

  constructor(
    private auditService: AuditService,
    private questionService: QuestionService,
    private speechService: SpeechService,
    private checkStartService: CheckStartService,
    private elRef: ElementRef,
    private auditEntryFactory: AuditEntryFactory,
    private monotonicTimeService: MonotonicTimeService,
    private windowRefService: WindowRefService
  ) {
    this.count = this.questionService.getNumberOfQuestions();
  }

  ngAfterViewInit() {
    this.auditService.addEntry(this.auditEntryFactory.createQuestionIntroRendered());

    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#start-now-button'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: Event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  async onClick() {
    if (this.startPending) return;
    this.startPending = true;
    this.startFailed = false;
    try {
      await this.checkStartService.acknowledge(this.attemptId);
    } catch (error) {
      this.startPending = false;
      if (error.status === 503 && error.error?.code === 'EMERGENCY_OFF_SWITCH_ENABLED') {
        this.emergencyEvent.emit();
        this.windowRefService.nativeWindow.location.assign(
          new URL('/emergency-off-switch-service-unavailable', APP_CONFIG.adminBaseUrl).toString()
        );
      } else {
        console.error('Unable to acknowledge check start', error);
        this.startFailed = true;
      }
      return;
    }
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    this.auditService.addEntry(this.auditEntryFactory.createCheckStarted(mtime));
    this.clickEvent.emit(null);
    void this.checkStartService.submit(mtime.formatAsDate());
  }

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }

}
