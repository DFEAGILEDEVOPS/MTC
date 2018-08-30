import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { Config } from '../config.model';

@Component({
  selector: 'app-familiarisation-settings',
  templateUrl: './familiarisation-settings.component.html',
  styleUrls: ['./familiarisation-settings.component.scss']
})
export class FamiliarisationSettingsComponent {
  private config: Config;

  constructor(
    private router: Router,
    private questionService: QuestionService
  ) {
    this.config = questionService.getConfig();
  }

  onClick() {
    this.router.navigate(['sign-in-success']);
  }

}
