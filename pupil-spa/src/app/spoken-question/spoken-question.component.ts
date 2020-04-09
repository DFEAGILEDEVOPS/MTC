import { Component, OnInit, AfterViewInit, NgZone, OnDestroy, Input } from '@angular/core';
import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { QuestionComponent } from '../question/question.component';
import { QuestionRendered, QuestionTimerEnded } from '../services/audit/auditEntry';
import { QuestionService } from '../services/question/question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { Subscription } from 'rxjs';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-spoken-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenQuestionComponent extends QuestionComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected registerInputService: RegisterInputService,
              protected zone: NgZone,
              protected storageService: StorageService,
              protected speechService: SpeechService,
              protected questionService: QuestionService,
              protected answerService: AnswerService) {
    super(auditService, windowRefService, registerInputService, questionService, storageService, speechService, answerService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.shouldShowQuestion = false;

    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (!this.timeout && speechStatus === SpeechService.questionSpeechEnded) {
          // console.log('SpokenQuestionComponent: Starting the timer');
          this.startTimer();
          this.shouldShowQuestion = true;
        }
      });
    });
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    this.speechService.speakQuestion(`${this.factor1} times ${this.factor2}?`, this.sequenceNumber);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
