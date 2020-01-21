import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { AppHidden, AppVisible, CheckSubmissionFailed, RefreshDetected } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { APP_CONFIG } from '../services/config/config.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AppInsights } from 'applicationinsights-js';

@Component({
  selector: 'app-submission-failed',
  templateUrl: './submission-failed.component.html',
  styleUrls: ['./submission-failed.component.scss']
})
export class SubmissionFailedComponent implements OnInit, AfterViewInit, OnDestroy {

  public supportNumber: string;
  protected window: any;
  private speechListenerEvent: any;

  constructor(private auditService: AuditService,
              protected windowRefService: WindowRefService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    this.supportNumber = APP_CONFIG.supportNumber;
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.auditService.addEntry(new CheckSubmissionFailed());
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/submission-failed'
    });
    AppInsights.trackPageView('Submission failed', '/submission-failed');
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    this.auditService.addEntry(new RefreshDetected());
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
    (window as any).GOVUK.details.addDetailsPolyfill();
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#retry-button'));
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
}
