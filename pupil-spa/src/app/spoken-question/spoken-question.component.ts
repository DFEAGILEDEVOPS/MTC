import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { QuestionComponent } from '../question/question.component';
import { QuestionRendered } from '../services/audit/auditEntry';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-spoken-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenQuestionComponent extends QuestionComponent implements OnInit, AfterViewInit {

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected registerInputService: RegisterInputService,
              protected zone: NgZone,
              protected speechService: SpeechService) {
    super(auditService, windowRefService, registerInputService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (speechStatus === SpeechService.speechEnded) {
          console.log('Starting the timer');
          this.startTimer();
        }
      });
    });
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered());
    this.speechService.speak(`${this.factor1} times ${this.factor2}?`);
  }
}
