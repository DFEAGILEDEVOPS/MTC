import { Component } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-preview-completed',
  templateUrl: './preview-completed.component.html',
  styleUrls: ['./preview-completed.component.scss']
})
export class PreviewCompletedComponent {
  public feedbackGiven: Boolean;

  constructor(private storage: StorageService) {
    this.feedbackGiven = this.storage.getItem('feedback_given') === true;

    AppInsights.trackPageView('ICT-Survey Preview Completed', '/ict-survey/preview-completed');
  }

}
