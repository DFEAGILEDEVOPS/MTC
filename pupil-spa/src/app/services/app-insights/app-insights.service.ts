import { Injectable } from '@angular/core';
import { ApplicationInsights, IExceptionTelemetry, ITelemetryItem } from '@microsoft/applicationinsights-web';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { APP_CONFIG } from '../config/config.service';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class ApplicationInsightsService {
  private appInsights: ApplicationInsights;

  constructor(private router: Router, private meta: Meta) {
    if (!APP_CONFIG.applicationInsightsInstrumentationKey) {
      return;
    }

    this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: APP_CONFIG.applicationInsightsInstrumentationKey
      }
    });

    this.appInsights.loadAppInsights();
    this.loadCustomTelemetryProperties();
    this.createRouterSubscription();
  }

  setUserId(userId: string) {
    if (!this.appInsights) { return; }
    this.appInsights.setAuthenticatedUserContext(userId);
  }

  clearUserId() {
    if (!this.appInsights) { return; }
    this.appInsights.clearAuthenticatedUserContext();
  }

  trackPageView(name?: string, uri?: string) {
    if (!this.appInsights) { return; }
    this.appInsights.trackPageView({ name, uri });
  }

  trackException(error: Error) {
    if (!this.appInsights) { return; }
    const exception: IExceptionTelemetry = {
      exception: error
    };
    this.appInsights.trackException(exception);
  }

  private loadCustomTelemetryProperties() {
    const buildNumberTelemetryInitializer = (envelope: ITelemetryItem) => {
      const baseData = envelope.data.baseData;
      baseData.properties = baseData.properties || {};
      baseData.properties['buildNumber'] = this.meta.getTag('name="build:number"').content;
    };
    this.appInsights.addTelemetryInitializer(buildNumberTelemetryInitializer);
  }

  private createRouterSubscription() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.trackPageView(null, event.urlAfterRedirects);
    });
  }
}
