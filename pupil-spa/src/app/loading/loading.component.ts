import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { AuditEntryFactory } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { Question } from '../services/question/question.model';
import { Config } from '../config.model';
import { IdleModalComponent } from '../modal/idle.modal.component';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    standalone: false
})

export class LoadingComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

  protected speechListenerEvent: any;
  protected timeouts: number[] = [];
  public config: Config;
  public nextButtonDelayFinished = false;

  @ViewChild('modalContainer', { read: ViewContainerRef })
  modalContainer!: ViewContainerRef;

  @Input()
  public shouldShowWarningModal = true;

  @Input()
  public nextQuestionButtonDelay = 2;

  @Input()
  public nextQuestionIdleTimeout = 30;

  @Input()
  public question: Question = new Question(0, 0, 0);

  @Input()
  public total = 0;

  @Input()
  public loadingTimeout: number;

  @Output()
  public timeoutEvent = new EventEmitter<void>();

  @Input() public familiarisationCheck = false;

  constructor(protected auditService: AuditService,
              protected questionService: QuestionService,
              protected speechService: SpeechService,
              protected elRef: ElementRef,
              protected auditEntryFactory: AuditEntryFactory) {
    this.config = this.questionService.getConfig();
  }

  /**
   * Prevent Backspace doing anything while the load-page is showing - some browsers will
   * go back a page.
   *
   * @param {KeyboardEvent} event
   */
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log(`loading.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    // IMPORTANT: return false here
    event.preventDefault();

    if (!this.nextButtonDelayFinished) {
      return false;
    }

    const key = event.key;

    switch (key) {
      case 'Enter':
        this.sendTimeoutEvent();
        break;
    }

    return false;
  }

  addAuditServiceEntry() {
    const data = {
      sequenceNumber: this.question.sequenceNumber,
      question: `${this.question.factor1}x${this.question.factor2}`,
      isWarmup: false
    }
    this.auditService.addEntry(this.auditEntryFactory.createPauseRendered(data))
  }

  showWarningModal() {
    const modalRef = this.modalContainer.createComponent(IdleModalComponent)
    modalRef.instance.closeCallback = () => {
      modalRef.destroy()
    }
  }

  async ngAfterViewInit() {
    this.addAuditServiceEntry();

    // wait for the component to be rendered first, before parsing the text
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.speakElement(this.elRef.nativeElement);
      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus', async (event: Event) => {
        if (document.getElementsByClassName('modal-overlay').length) {
          // a modal is open, ignore focus events on this component
          return false;
        }
        await this.speechService.waitForEndOfSpeech();
        await this.speechService.speakFocusedElement(event.target);
      }, true);
    }

    if (this.config.nextBetweenQuestions && this.shouldShowWarningModal) {
      const timeout1 = window.setTimeout(async () => {
        this.showWarningModal();
      }, this.nextQuestionIdleTimeout * 1000);
      this.timeouts.push(timeout1)
    }

    if (!this.config.nextBetweenQuestions) {
      const timeout2 = window.setTimeout(async () => {
        if (this.config.questionReader) {
          await this.speechService.waitForEndOfSpeech();
        }

        this.sendTimeoutEvent();
      }, this.loadingTimeout * 1000);
      this.timeouts.push(timeout2)
    } else {
      const timeout3 = window.setTimeout(() => {
        this.nextButtonDelayFinished = true;
      }, this.nextQuestionButtonDelay * 1000);
      this.timeouts.push(timeout3)
    }
  }

  /**
   * Usually this screen is shown for 3 seconds, except when the next button between questions is shown
   * the button just calls this function in the onClick handler.
   */
  async sendTimeoutEvent() {
    // Make sure we cancel the speech service before we trigger the next page. PBI #58403
    // There may be duplication of code here, but getting the order correct prevents a possible race condition.
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();
    }
    this.timeoutEvent.emit()
  }

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();
      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
    this.cleanupTheTimeouts()
  }

  protected cleanupTheTimeouts (): void {
    this.timeouts.forEach(n => { window.clearTimeout(n) })
  }

  ngAfterViewChecked() {
    if (this.config.nextBetweenQuestions && this.nextButtonDelayFinished) {
      this.elRef.nativeElement.querySelector('#goButton').focus();
    }
  }
}
