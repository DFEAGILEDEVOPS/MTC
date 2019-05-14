import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { SessionExpired } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { AppInsights } from 'applicationinsights-js';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionService } from '../services/question/question.service';
import { SpeechService } from '../services/speech/speech.service';
import { APP_CONFIG } from '../services/config/config.service';

@Component({
  selector: 'app-session-expired',
  templateUrl: './session-expired.component.html',
  styleUrls: ['./session-expired.component.scss']
})
export class SessionExpiredComponent implements OnInit, AfterViewInit, OnDestroy {

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
    this.auditService.addEntry(new SessionExpired());
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/session-expired'
    });
    AppInsights.trackPageView('Session Expired', '/session-expired');
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
