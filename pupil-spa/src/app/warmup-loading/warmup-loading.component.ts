import { Component, AfterViewInit, ElementRef, OnDestroy, Input } from '@angular/core';
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
export class WarmupLoadingComponent extends LoadingComponent implements AfterViewInit, OnDestroy {

  @Input() public familiarisationCheck = false;

  addAuditServiceEntry() {
    this.auditService.addEntry(new PauseRendered({
      practiseSequenceNumber: this.question.sequenceNumber,
      question: `${this.question.factor1}x${this.question.factor2}`
    }));
  }
}
