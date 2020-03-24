import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { APP_CONFIG } from './services/config/config.service';
import { AppInsights } from 'applicationinsights-js';
import { RouteService } from './services/route/route.service';

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
    protected windowRefService: WindowRefService,
    private meta: Meta,
    private routeService: RouteService,
    private router: Router
  ) {
    this.window = windowRefService.nativeWindow;
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
    // start listening for route changes
    this.routeService.setup();

    if (APP_CONFIG.websiteOffline) {
      this.router.navigate(['/service-unavailable']);
    }
  }
}
