import { Component, AfterViewInit, Input, Output, EventEmitter, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { PauseRendered } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent implements AfterViewInit, OnDestroy {

  @Input()
  public question = 0;

  @Input()
  public total = 0;

  @Input()
  public loadingTimeout: number;

  @Output()
  timeoutEvent: EventEmitter<any> = new EventEmitter();

  constructor(private auditService: AuditService,
              protected questionService: QuestionService,
              protected speechService: SpeechService,
              protected elRef: ElementRef) {
  }

  /**
   * Prevent Backspace doing anything while the load-page is showing - some browsers will
   * go back a page.
   *
   * @param {KeyboardEvent} event
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log(`loading.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    // IMPORTANT: return false here
    event.preventDefault();
    return false;
  }

  ngAfterViewInit() {
    // console.log('loading.component: after view init called');
    this.auditService.addEntry(new PauseRendered());
    setTimeout(() => {
      this.sendTimeoutEvent();
    }, this.loadingTimeout * 1000);

    // wait for the component to be rendered first, before parsing the text
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);
    }
  }

  sendTimeoutEvent() {
    this.timeoutEvent.emit(null);
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    this.speechService.cancel();
  }
}
