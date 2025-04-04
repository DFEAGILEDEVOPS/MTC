import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { Router } from '@angular/router';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { Config } from '../config.model';

@Component({
    selector: 'app-check-complete',
    templateUrl: './check-complete.component.html',
    styleUrls: ['./check-complete.component.css'],
    standalone: false
})
export class CheckCompleteComponent implements OnInit, AfterViewInit, OnDestroy {

  protected window: any;
  private speechListenerEvent: any;
  public familiarisationCheck: boolean;
  public hasAccessSettings: boolean;

  constructor(protected windowRefService: WindowRefService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef,
              private storageService: StorageService,
              private warmupQuestionService: WarmupQuestionService,
              private router: Router) {
    this.window = windowRefService.nativeWindow;
    const config = questionService.getConfig();
    this.hasAccessSettings = config && (config.fontSize || config.colourContrast);
  }

  ngOnInit() {
    const config: Config = this.warmupQuestionService.getConfig();
    this.familiarisationCheck = config && config.practice;
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#sign-out'));
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

  onStartAgainClick(event: any): void {
    event.preventDefault();
    this.storageService.removeCheckState();
    this.storageService.removeTimeout();
    this.storageService.removeCheckStartTime();
    this.storageService.setCompletedSubmission(false);
    this.router.navigate(['/check-start']);
  }
}
