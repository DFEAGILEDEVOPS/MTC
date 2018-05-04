import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { AuditService } from '../services/audit/audit.service';
import { PauseRendered } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-warmup-loading',
  templateUrl: './warmup-loading.component.html',
  styles: []
})
export class WarmupLoadingComponent extends LoadingComponent implements AfterViewInit {

  constructor(auditService: AuditService,
              questionService: QuestionService,
              speechService: SpeechService,
              elRef: ElementRef) {
    super(auditService, questionService, speechService, elRef);
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new PauseRendered({
      practiseSequenceNumber: this.question.sequenceNumber,
      question: `${this.question.factor1}x${this.question.factor2}`
    }));

    // wait for the component to be rendered first, before parsing the text
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);

      setTimeout(() => {
        this.speechService.waitForEndOfSpeech().then(() => {
          this.sendTimeoutEvent();
        });
      }, this.loadingTimeout * 1000);
    } else {
      setTimeout(() => {
        this.sendTimeoutEvent();
      }, this.loadingTimeout * 1000);
    }
  }
}
