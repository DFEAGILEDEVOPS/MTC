import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { AuditService } from '../services/audit/audit.service';
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
              private elRef: ElementRef,
              private auditEntryFactory: AuditEntryFactory) {
    this.supportNumber = APP_CONFIG.supportNumber;
    this.window = windowRefService.nativeWindow;
  }


  ngOnInit() {
    this.auditService.addEntry(this.auditEntryFactory.createSessionExpired());
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    (window as any).GOVUK.details.addDetailsPolyfill();
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#retry-button'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event: Event) => { this.speechService.focusEventListenerHook(event); },
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
