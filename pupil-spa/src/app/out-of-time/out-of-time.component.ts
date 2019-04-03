import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AppInsights } from 'applicationinsights-js';
import { StorageService } from '../services/storage/storage.service';
import { TimeoutStorageKey } from '../services/timer/timer.service';
import { UserService } from '../services/user/user.service';
import { WarmupQuestionService } from '../services/question/warmup-question.service';

@Component({
  selector: 'app-out-of-time',
  templateUrl: './out-of-time.component.html',
  styleUrls: ['./out-of-time.component.scss']
})
export class OutOfTimeComponent implements OnInit, AfterViewInit, OnDestroy {

  protected window: any;
  public numQuestions: number;
  public numCompleted: number;
  private speechListenerEvent: any;

  constructor(protected windowRefService: WindowRefService,
              private storageService: StorageService,
              private userService: UserService,
              private questionService: QuestionService,
              private warmupQuestionService: WarmupQuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    this.window = windowRefService.nativeWindow;
    const timeoutData = this.storageService.getItem(TimeoutStorageKey);
    if (timeoutData) {
       this.numQuestions = timeoutData.numQuestions;
       this.numCompleted = timeoutData.numCompleted;
    }
    this.userService.logout();
    this.questionService.reset();
    this.warmupQuestionService.reset();
  }

  ngOnInit() {
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/out-of-time'
    });
    AppInsights.trackPageView('Check complete', '/out-of-time');
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
        (event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  ngOnDestroy(): void {
    const config = this.questionService.getConfig();
    // stop the current speech process if the page is changed
    if (config && config.questionReader) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
