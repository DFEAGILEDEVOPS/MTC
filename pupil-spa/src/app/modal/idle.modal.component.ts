import { Component, Input, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { Config } from '../config.model';
import { QuestionService } from '../services/question/question.service';
import { SpeechService } from '../services/speech/speech.service';

@Component({
  selector: 'app-idle-modal-component',
  templateUrl: './idle.modal.component.html',
  styleUrls: ['./idle.modal.component.scss']
})
export class IdleModalComponent implements AfterViewInit, OnDestroy {

    public closeCallback: Function;
    protected timeRemaining: number;
    protected speechListenerEvent: any;
    protected interval: any;

    constructor(
      private questionService: QuestionService,
      private elRef: ElementRef,
      protected speechService: SpeechService
      ) {

      this.timeRemaining = this.questionService.getCheckTimeRemaining();

      this.interval = setInterval(() => {
        this.timeRemaining = this.questionService.getCheckTimeRemaining();
        if (this.timeRemaining <= 0) {
          clearInterval(this.interval);
        }
      }, 1000);
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
      clearInterval(this.interval);

      if (this.questionService.getConfig().questionReader) {
        this.speechService.cancel();

        this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
      }
    }
}

