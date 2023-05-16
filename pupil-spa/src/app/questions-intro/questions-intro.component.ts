import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';

import { AuditEntryFactory } from '../services/audit/auditEntry'
import { AuditService } from '../services/audit/audit.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { CheckStartService } from '../services/check-start/check-start.service';
import { MonotonicTimeService } from '../services/monotonic-time/monotonic-time.service'

@Component({
  selector: 'app-questions-intro',
  templateUrl: './questions-intro.component.html',
  styleUrls: ['./questions-intro.component.scss']
})
export class QuestionsIntroComponent implements AfterViewInit, OnDestroy {

  private speechListenerEvent: any;

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  public count: number;

  constructor(
    private auditService: AuditService,
    private questionService: QuestionService,
    private speechService: SpeechService,
    private checkStartService: CheckStartService,
    private elRef: ElementRef,
    private auditEntryFactory: AuditEntryFactory,
    private monotonicTimeService: MonotonicTimeService
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
    const mtime = this.monotonicTimeService.getMonotonicDateTime()
    this.auditService.addEntry(this.auditEntryFactory.createCheckStarted(mtime));
    this.clickEvent.emit(null);
    await this.checkStartService.submit(mtime.formatAsDate());
  }

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }

}
