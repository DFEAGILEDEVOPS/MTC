import { Component,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  OnDestroy,
  AfterViewChecked,
  ComponentFactoryResolver,
  ComponentRef,
  ViewContainerRef
} from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { PauseRendered } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { Question } from '../services/question/question.model';
import { Config } from '../config.model';
import { IdleModalComponent } from '../modal/idle.modal.component';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

  protected speechListenerEvent: any;
  public config: Config;
  public nextButtonDelayFinished = false;

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
  timeoutEvent: EventEmitter<any> = new EventEmitter();

  @Input() public familiarisationCheck = false;

  constructor(protected auditService: AuditService,
              protected questionService: QuestionService,
              protected speechService: SpeechService,
              protected elRef: ElementRef,
              protected componentFactoryResolver: ComponentFactoryResolver,
              protected viewContainerRef: ViewContainerRef) {
    this.config = this.questionService.getConfig();
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
    this.auditService.addEntry(new PauseRendered({
      sequenceNumber: this.question.sequenceNumber,
      question: `${this.question.factor1}x${this.question.factor2}`
    }));
  }

  showWarningModal() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(IdleModalComponent);
    const ref: ComponentRef<IdleModalComponent> = this.viewContainerRef.createComponent(factory);
    ref.instance.closeCallback = () => {
      ref.destroy();
    };
  }

  ngAfterViewInit() {
    this.addAuditServiceEntry();

    // wait for the component to be rendered first, before parsing the text
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement);
      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus', async (event) => {
        if (document.getElementsByClassName('modal-overlay').length) {
          // a modal is open, ignore focus events on this component
          return false;
        }
        await this.speechService.waitForEndOfSpeech();
        this.speechService.speakFocusedElement(event.target);
      }, true);
    }

    if (this.config.nextBetweenQuestions && this.shouldShowWarningModal) {
      setTimeout(async () => {
        this.showWarningModal();
      }, this.nextQuestionIdleTimeout * 1000);
    }

    if (!this.config.nextBetweenQuestions) {
      setTimeout(async () => {
        if (this.config.questionReader) {
          await this.speechService.waitForEndOfSpeech();
        }

        this.sendTimeoutEvent();
      }, this.loadingTimeout * 1000);
    } else {
      setTimeout(() => {
        this.nextButtonDelayFinished = true;
      }, this.nextQuestionButtonDelay * 1000);
    }
  }

  sendTimeoutEvent() {
    this.timeoutEvent.emit(null);
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }

  ngAfterViewChecked() {
    if (this.config.nextBetweenQuestions && this.nextButtonDelayFinished) {
      this.elRef.nativeElement.querySelector('#goButton').focus();
    }
  }
}
