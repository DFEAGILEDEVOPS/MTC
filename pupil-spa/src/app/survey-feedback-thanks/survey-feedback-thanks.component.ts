import { Component } from '@angular/core';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-survey-feedback-thanks',
  templateUrl: './survey-feedback-thanks.component.html',
  styleUrls: ['./survey-feedback-thanks.component.scss']
})
export class SurveyFeedbackThanksComponent {
  private previewed: Boolean;

  constructor(private storage: StorageService) {
    this.previewed = this.storage.getItem('preview_completed') === true ? true : false;
  }

}
