import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { APP_CONFIG } from './services/config/config.service';
import { RouteService } from './services/route/route.service';
// import { ApplicationInsights } from '@microsoft/applicationinsights-web';
// import { AngularPlugin, AngularPluginService } from '@microsoft/applicationinsights-angularplugin-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss',
    '../assets/shared-styles/styles.scss'
  ]
})
export class AppComponent implements OnInit {
  protected window: any;
  // private appInsights: ApplicationInsights;

  constructor(
    protected windowRefService: WindowRefService,
    private meta: Meta,
    private routeService: RouteService,
    private router: Router,
    // private angularPluginService: AngularPluginService
  ) {
    this.window = windowRefService.nativeWindow;
/*     if (APP_CONFIG.applicationInsightsInstrumentationKey) {
      const angularPlugin = new AngularPlugin();
      this.angularPluginService.init(angularPlugin, this.router);
      this.appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: APP_CONFIG.applicationInsightsInstrumentationKey,
          extensions: [angularPlugin],
          extensionConfig: {
            [angularPlugin.identifier]: { router: this.router }
          }
        }
      });
      const buildNumberTelemetryInitializer = (envelope) => {
        const baseData = envelope.data.baseData;
        baseData.properties = baseData.properties || {};
        baseData.properties['buildNumber'] = meta.getTag('name="build:number"').content;
      }
      this.appInsights.addTelemetryInitializer(buildNumberTelemetryInitializer)
    } */
    // start listening for route changes
    this.routeService.setup();

    if (APP_CONFIG.websiteOffline) {
      this.router.navigate(['/service-unavailable']);
    }
  }
  ngOnInit (): void {
    // this.appInsights.loadAppInsights();
  }
}
