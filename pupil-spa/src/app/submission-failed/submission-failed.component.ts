import { Component, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CheckSubmissionFailed } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { environment } from '../../environments/environment';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';


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
    this.supportNumber = environment.supportNumber;
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.auditService.addEntry(new CheckSubmissionFailed());
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/submission-failed'
    });
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus', (event) => {
        this.speechService.speakFocusedElement(event.target);
      }, true);
    }
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
