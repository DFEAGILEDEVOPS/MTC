import { Component, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { UserService } from '../services/user/user.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';

@Component({
    selector: 'app-out-of-time',
    templateUrl: './out-of-time.component.html',
    styleUrls: ['./out-of-time.component.scss'],
    standalone: false
})
export class OutOfTimeComponent implements AfterViewInit, OnDestroy {

  protected window: any;
  private speechListenerEvent: any;
  public familiarisationCheck: boolean;

  constructor(protected windowRefService: WindowRefService,
              private userService: UserService,
              private questionService: QuestionService,
              private warmupQuestionService: WarmupQuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    this.window = windowRefService.nativeWindow;
    const config = this.questionService.getConfig();
    this.familiarisationCheck = config && config.practice;
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    (window as any).GOVUK.details.addDetailsPolyfill();
    const config = this.questionService.getConfig();
    if (config && config.questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#sign-out'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: Event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
    this.userService.logout();
    this.questionService.reset();
    this.warmupQuestionService.reset();
  }

  async ngOnDestroy(): Promise<void> {
    const config = this.questionService.getConfig();
    // stop the current speech process if the page is changed
    if (config && config.questionReader) {
      await this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
