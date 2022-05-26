import { Component, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { QuestionService } from '../services/question/question.service';
import { SpeechService } from '../services/speech/speech.service';
import { TimerService } from '../services/timer/timer.service';

@Component({
  selector: 'app-idle-modal-component',
  templateUrl: './idle.modal.component.html',
  styleUrls: ['./idle.modal.component.scss']
})
export class IdleModalComponent implements AfterViewInit, OnDestroy {

    public closeCallback: Function;
    protected speechListenerEvent: any;

    constructor(
      private questionService: QuestionService,
      private elRef: ElementRef,
      protected speechService: SpeechService,
      public timerService: TimerService
      ) {
    }

    onClick(): void {
      this.closeCallback();
    }

    ngAfterViewInit() {
      if (this.questionService.getConfig().questionReader) {

        this.speechService.speakElement(this.elRef.nativeElement).then(() => {
          this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#continue'));
        });

        this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
          (event) => { this.speechService.focusEventListenerHook(event); },
          true
        );
      }
    }

    ngOnDestroy(): void {

      if (this.questionService.getConfig().questionReader) {
        this.speechService.cancel();

        this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
      }
    }
}

