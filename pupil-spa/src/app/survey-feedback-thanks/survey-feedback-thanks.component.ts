import { Component } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-survey-feedback-thanks',
  templateUrl: './survey-feedback-thanks.component.html',
  styleUrls: ['./survey-feedback-thanks.component.scss']
})
export class SurveyFeedbackThanksComponent {
  public previewed: Boolean;

  constructor(private storage: StorageService) {
    this.previewed = this.storage.getItem('preview_completed') === true;

    AppInsights.trackPageView('ICT-Survey Feedback Thanks', '/ict-survey/feedback-thanks');
  }

}
