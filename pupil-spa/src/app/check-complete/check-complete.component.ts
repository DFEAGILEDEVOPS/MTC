import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AppInsights } from 'applicationinsights-js';
import { StorageService } from '../services/storage/storage.service';
import { Router } from '@angular/router';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { Config } from '../config.model';
import { AppHidden, AppVisible } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
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
              private auditService: AuditService,
              private router: Router) {
    this.window = windowRefService.nativeWindow;
    const config = questionService.getConfig();
    this.hasAccessSettings = config && (config.fontSize || config.colourContrast);
  }

  ngOnInit() {
    const config: Config = this.warmupQuestionService.getConfig();
    this.familiarisationCheck = config && config.practice;

    this.window.ga('send', {
      hitType: 'pageview',
      page: '/check-complete'
    });
    AppInsights.trackPageView('Check complete', '/check-complete');
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange() {
    const visibilityState = document.visibilityState;
    if (visibilityState === 'hidden') {
      this.auditService.addEntry(new AppHidden());
    }
    if (visibilityState === 'visible') {
      this.auditService.addEntry(new AppVisible());
    }
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
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
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }

  onStartAgainClick(event): void {
    event.preventDefault();
    this.storageService.removeCheckState();
    this.storageService.removeTimeout();
    this.storageService.removeCheckStartTime();
    this.storageService.setCompletedSubmission(false);
    this.router.navigate(['/check-start']);
  }
}
