import { Component } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { APP_CONFIG } from '../services/config/config.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {

  constructor() {
    AppInsights.trackPageView('ICT-Survey Privacy', '/ict-survey/privacy');
  }
}
