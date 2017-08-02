import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
    '../assets/shared-styles/styles.scss'
  ]
})
export class AppComponent {
  govukRoot = 'https://www.gov.uk';
  govukAssetPath = 'assets/govuk_template';
  globalHeaderText = 'GOV.UK';
}
