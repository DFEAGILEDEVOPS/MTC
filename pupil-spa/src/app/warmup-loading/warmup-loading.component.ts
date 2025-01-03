import { Component, AfterViewInit, OnDestroy, Input, ElementRef, ViewContainerRef } from '@angular/core'
import { LoadingComponent } from '../loading/loading.component';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { AuditService } from '../services/audit/audit.service'
import { QuestionService } from '../services/question/question.service'
import { SpeechService } from '../services/speech/speech.service'

@Component({
  selector: 'app-warmup-loading',
  templateUrl: './warmup-loading.component.html',
  styles: []
})
export class WarmupLoadingComponent extends LoadingComponent implements AfterViewInit, OnDestroy {

  @Input() public familiarisationCheck = false;

  constructor(protected auditService: AuditService,
              protected questionService: QuestionService,
              protected speechService: SpeechService,
              protected elRef: ElementRef,
              protected viewContainerRef: ViewContainerRef,
              protected auditEntryFactory: AuditEntryFactory) {
    super(auditService, questionService, speechService, elRef, auditEntryFactory)
  }

  addAuditServiceEntry() {
    const data = {
      sequenceNumber: this.question.sequenceNumber,
      question: `${this.question.factor1}x${this.question.factor2}`,
      isWarmup: true
    }
    this.auditService.addEntry(this.auditEntryFactory.createPauseRendered(data))
  }
}
