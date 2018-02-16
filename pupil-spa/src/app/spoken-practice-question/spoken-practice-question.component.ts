import { Component, NgZone, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionRendered } from '../services/audit/auditEntry';

@Component({
  selector: 'app-spoken-practice-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenPracticeQuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected speechService: SpeechService,
              protected zone: NgZone) {
    super(auditService, windowRefService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (speechStatus === SpeechService.speechEnded) {
          this.startTimer();
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
    this.speechService.speak(`${this.factor1} times ${this.factor2}?`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
