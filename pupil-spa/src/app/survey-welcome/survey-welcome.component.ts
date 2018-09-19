import { Component } from '@angular/core';

@Component({
  selector: 'app-survey-welcome',
  templateUrl: './survey-welcome.component.html',
  styleUrls: ['./survey-welcome.component.scss']
})
export class SurveyWelcomeComponent {
  public showDetails: Boolean = false;

  constructor() { }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
