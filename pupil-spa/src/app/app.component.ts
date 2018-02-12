import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
// import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
    '../assets/shared-styles/styles.scss'
  ]
})
export class AppComponent {
  // Example usage of NGX Logger
  // constructor(private logger: NGXLogger) {
  //   this.logger.debug('Your log message goes here');
  // };
  constructor(angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {}
}
