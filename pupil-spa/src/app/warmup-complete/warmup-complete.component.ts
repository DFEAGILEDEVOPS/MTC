import { Component, Output, EventEmitter, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-warmup-complete',
  templateUrl: './warmup-complete.component.html',
  styles: []
})
export class WarmupCompleteComponent implements AfterViewInit, OnDestroy {
  private speechListenerEvent: any;

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  public count: number;
  public shouldShowMore: boolean;

  constructor(
    private auditService: AuditService,
    private questionService: QuestionService,
    private speechService: SpeechService,
    private elRef: ElementRef,
    private auditEntryFactrory: AuditEntryFactory
  ) {
    this.count = this.questionService.getNumberOfQuestions();
    const config = this.questionService.getConfig();
    this.shouldShowMore = config && config.practice && (config.fontSize || config.colourContrast);
  }

  ngAfterViewInit() {
    this.auditService.addEntry(this.auditEntryFactrory.createWarmupCompleteRendered());

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
    this.clickEvent.emit(null);
  }

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
