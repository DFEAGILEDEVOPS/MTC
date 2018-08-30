import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-survey-welcome',
  templateUrl: './survey-welcome.component.html',
  styleUrls: ['./survey-welcome.component.scss']
})
export class SurveyWelcomeComponent implements OnInit {
  showDetails = false;
  
  constructor() { }

  ngOnInit() {
  }

  toggleDetails() {
    this.showDetails = !this.showDetails
  }

}
