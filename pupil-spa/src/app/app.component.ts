import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { APP_CONFIG } from './services/config/config.service';
import { AppInsights } from 'applicationinsights-js';

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

  protected window: any;

  constructor(
    protected angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    protected windowRefService: WindowRefService,
    private meta: Meta
  ) {
    this.window = windowRefService.nativeWindow;
    if (APP_CONFIG.googleAnalyticsTrackingCode) {
      this.window.ga('create', APP_CONFIG.googleAnalyticsTrackingCode, 'auto');
    }
    if (APP_CONFIG.applicationInsightsInstrumentationKey) {
      AppInsights.downloadAndSetup({
        instrumentationKey: APP_CONFIG.applicationInsightsInstrumentationKey
      });
      AppInsights.queue.push(function () {
        AppInsights.context.addTelemetryInitializer(function (envelope) {
          const telemetryItem = envelope.data.baseData;
          telemetryItem.properties = telemetryItem.properties || {};
          telemetryItem.properties['buildNumber'] = meta.getTag('name="build:number"').content;
        });
      });
    }
  }
}
