import { Component } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';

@Component({
  selector: 'app-survey-welcome',
  templateUrl: './survey-welcome.component.html',
  styleUrls: ['./survey-welcome.component.scss']
})
export class SurveyWelcomeComponent {
  public showDetails: Boolean = false;

  constructor() {
    AppInsights.trackPageView('ICT-Survey Start', '/ict-survey/start');
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
