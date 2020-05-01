import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { QuestionRendered } from '../services/audit/auditEntry';
import { QuestionService } from '../services/question/question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-spoken-practice-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenPracticeQuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription;

  /**
   * Do not show 'practice' label on top left.
   */
  public isWarmUpQuestion = true;


  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected speechService: SpeechService,
              protected zone: NgZone,
              protected storageService: StorageService,
              protected questionService: QuestionService,
              protected answerService: AnswerService,
              protected registerInputService: RegisterInputService) {
    super(auditService, windowRefService, questionService, storageService, speechService, answerService, registerInputService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.shouldShowQuestion = false;
    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (!this.timeout && speechStatus === SpeechService.questionSpeechEnded) {
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
      practiseSequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    this.speechService.speakQuestion(`${this.factor1} times ${this.factor2}?`, this.sequenceNumber);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
