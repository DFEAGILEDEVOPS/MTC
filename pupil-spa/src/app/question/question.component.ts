import { Component, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { QuestionService } from '../services/question/question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit {
  /**
   * Do not show 'practice' label on top left.
   */
  public isWarmUpQuestion = false;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected questionService: QuestionService,
              protected storageService: StorageService,
              protected speechService: SpeechService,
              protected answerService: AnswerService,
              protected registerInputService: RegisterInputService,
              protected renderer: Renderer2,
              protected auditEntryFactory: AuditEntryFactory) {
    super(auditService, windowRefService, questionService, storageService, speechService, answerService, registerInputService, renderer, auditEntryFactory);
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   * @param {Object} event
   */
  onClickBackspace(event: Event) {
    if (this.submitted) {
      return;
    }
    this.registerInputService.storeEntry('Backspace',
      this.getEventType(event),
      this.sequenceNumber,
      `${this.factor1}x${this.factor2}`,
      event.timeStamp
    );
    this.deleteChar();
  }

  /**
   * Called from pressing Enter on the virtual Keypad or pressing the enter key on the keyboard
   * @override
   * @return {boolean}
   */
  onSubmit() {
    if (this.submitted) {
      return false;
    }
    if (!this.hasAnswer()) {
      return false;
    }
    // Prevent the default timeout from firing later
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    } else {
      return false;
    }
    // Store the answer
    this.answerService.setAnswer(this.factor1, this.factor2, this.answer, this.sequenceNumber);

    // Clear the interval timer and add a QuestionTimerCancelled event.question.
    if (this.countdownInterval !== undefined) {
      const data = {
        sequenceNumber: this.sequenceNumber,
        question: `${this.factor1}x${this.factor2}`,
        isWarmup: this.isWarmUpQuestion
      }
      this.auditService.addEntry(this.auditEntryFactory.createQuestionTimerCancelled(data));
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }

    this.addQuestionAnsweredEvent();
    this.submitted = true;
    this.manualSubmitEvent.emit(this.answer);

    return true;
  }

  /**
   * Called when the user clicks the enter button on the virtual keypad
   * @param {Object} event
   */
  onClickSubmit(event: Event): void {
    if (this.submitted) {
      return;
    }
    this.registerInputService.storeEntry('Enter',
      this.getEventType(event),
      this.sequenceNumber,
      `${this.factor1}x${this.factor2}`,
      event.timeStamp
    );
    this.onSubmit();
  }

  addQuestionAnsweredEvent(): void {
    const data = {
        sequenceNumber: this.sequenceNumber,
        question: `${this.factor1}x${this.factor2}`,
        isWarmup: this.isWarmUpQuestion
    }
    this.auditService.addEntry(this.auditEntryFactory.createQuestionAnswered(data))
  }
}
