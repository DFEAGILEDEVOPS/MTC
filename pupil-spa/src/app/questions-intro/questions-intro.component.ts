import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import {
  QuestionIntroRendered,
  CheckStarted,
} from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { CheckStartService } from '../services/check-start/check-start.service';

@Component({
  selector: 'app-questions-intro',
  templateUrl: './questions-intro.component.html',
  styleUrls: ['./questions-intro.component.scss']
})
export class QuestionsIntroComponent implements OnInit, AfterViewInit, OnDestroy {

  private speechListenerEvent: any;

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  public count: number;

  constructor(
    private auditService: AuditService,
    private questionService: QuestionService,
    private speechService: SpeechService,
    private checkStartService: CheckStartService,
    private elRef: ElementRef
  ) {
    this.count = this.questionService.getNumberOfQuestions();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionIntroRendered());

    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#start-now-button'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  async onClick() {
    this.auditService.addEntry(new CheckStarted());
    this.clickEvent.emit(null);
    await this.checkStartService.submit();
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }

}
