import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-survey-feedback-thanks',
  templateUrl: './survey-feedback-thanks.component.html',
  styleUrls: ['./survey-feedback-thanks.component.scss']
})
export class SurveyFeedbackThanksComponent {
  private previewed: Boolean;

  constructor(private route: ActivatedRoute) {
    this.previewed = this.route.snapshot.paramMap.get('completed') === 'true' ? true : false;
  }

}
