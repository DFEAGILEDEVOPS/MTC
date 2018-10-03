import { Component } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-test-completed',
  templateUrl: './test-completed.component.html',
  styleUrls: ['./test-completed.component.scss']
})
export class TestCompletedComponent {
  public testSuccessful: Boolean;

  constructor(private storage: StorageService) {
    this.testSuccessful = this.storage.getItem('test_status') === true;

    AppInsights.trackPageView('ICT-Survey Test Completed', '/ict-survey/test-completed');
  }

}
