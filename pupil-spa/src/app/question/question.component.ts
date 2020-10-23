import { Component, OnInit, AfterViewInit, HostListener, Renderer2 } from '@angular/core';
import { AnswerService } from '../services/answer/answer.service';
import { Answer } from '../services/answer/answer.model';
import { AuditService } from '../services/audit/audit.service';
import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { QuestionRendered, QuestionAnswered, QuestionTimerCancelled } from '../services/audit/auditEntry';
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
              protected renderer: Renderer2) {
    super(auditService, windowRefService, questionService, storageService, speechService, answerService, registerInputService, renderer);
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));

    // Set up listening events depending on the browser's capability
    if ('onpointerup' in this.window) {
      this.setupKeypadEventListeners('pointerup');
    } else {
      this.setupKeypadEventListeners('click');
    }

    // Start the countdown and page timeout timers
    this.startTimer();
  }

  /**
   * Called from clicking the backspace button on the virtual keyboard
   * @param {Object} event
   */
  onClickBackspace(event) {
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
    const answer = new Answer(this.factor1, this.factor2, this.answer, this.sequenceNumber);
    this.answerService.setAnswer(answer);

    // Clear the interval timer and add a QuestionTimerCancelled event.question.
    if (this.countdownInterval) {
      this.auditService.addEntry(new QuestionTimerCancelled({
        sequenceNumber: this.sequenceNumber,
        question: `${this.factor1}x${this.factor2}`
      }));
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
  onClickSubmit(event) {
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

  addQuestionAnsweredEvent() {
    this.auditService.addEntry(new QuestionAnswered({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
  }
}
