import { Component, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { PauseRendered } from '../services/audit/auditEntry';

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
