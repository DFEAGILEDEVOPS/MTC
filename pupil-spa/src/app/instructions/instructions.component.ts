import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { AuditService } from '../services/audit/audit.service';
import { WarmupStarted} from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  public count: number;
  public loadingTime: number;
  public questionTime: number;
  protected window: any;

  constructor(
    private router: Router,
    private questionService: QuestionService,
    private auditService: AuditService,
    private speechService: SpeechService,
    protected windowRefService: WindowRefService) {
    this.count = this.questionService.getNumberOfQuestions();
    const config = this.questionService.getConfig();
    this.loadingTime = config.loadingTime;
    this.questionTime = config.questionTime;
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/instructions'
    });
  }

  onClick() {
    this.auditService.addEntry(new WarmupStarted());
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speak('Speech output is on.');
    }
    this.router.navigate(['check']);
  }

}
