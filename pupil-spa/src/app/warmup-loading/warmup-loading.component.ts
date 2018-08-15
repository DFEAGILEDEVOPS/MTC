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
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement);
    }
    this.elRef.nativeElement.querySelector('#goButton').focus();
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.cancel();
    }
  }
}
