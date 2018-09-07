import { Component } from '@angular/core';

@Component({
  selector: 'app-survey-welcome',
  templateUrl: './survey-welcome.component.html',
  styleUrls: ['./survey-welcome.component.scss']
})
export class SurveyWelcomeComponent {
  private showDetails: Boolean = false;

  constructor() { }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}
