import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
    selector: 'app-feedback-thanks',
    templateUrl: './feedback-thanks.component.html',
    styleUrls: ['./feedback-thanks.component.scss'],
    standalone: false
})
export class FeedbackThanksComponent implements AfterViewInit, OnDestroy {

  speechListenerEvent: any;

  constructor(
    private speechService: SpeechService,
    private questionService: QuestionService,
    private elRef: ElementRef
  ) { }

  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#next-pupil-button'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: any) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  async ngOnDestroy(): Promise<void> {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
