import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { AuditService } from '../services/audit/audit.service';
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
}
