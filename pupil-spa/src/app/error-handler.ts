import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { AuditService } from './services/audit/audit.service';
import { AppError } from './services/audit/auditEntry';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import { APP_CONFIG } from './services/config/config.service'
import { ApplicationInsightsService } from './services/app-insights/app-insights.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  protected window: any;

  constructor(private injector: Injector) { }

  handleError(error) {
    if (console && console.log) {
      console.log('Global error handler: ', error);
    }

    // Pick up our dependencies.  Don't use dependency injection - so this module can be loaded first.
    const auditService = this.injector.get(AuditService);
    const windowRefService = this.injector.get(WindowRefService);
    const window = windowRefService.nativeWindow;
    const location = this.injector.get(LocationStrategy);

    // Get the error details
    const errorMessage =  error.message ? error.message : error.toString();
    const url = location instanceof PathLocationStrategy ? location.path() : '';

    auditService.addEntry(
      new AppError({
          errorMessage,
          url,
          stackTrace: error.stack
        }
      ));

    window.ga('send', {
      hitType: 'pageview',
      page: '/error'
    });

    window.ga('send', {
      hitType: 'event',
      eventCategory: 'error',
      eventAction: url,
      eventLabel: errorMessage
    });

    if (APP_CONFIG.applicationInsightsInstrumentationKey) {
      // usage of injector is apparently 'flaky' but explained here...
      // https://tutorialsforangular.com/2020/02/03/adding-azure-application-insights-to-your-angular-app/
      const appInsightsService = this.injector.get(ApplicationInsightsService);
      appInsightsService.trackException(error);
      appInsightsService.trackPageView('error', '/error');
// necessary? we are now logging exception explicitly above
/*       appInsights.trackEvent('Error', {
        url: url,
        errorMessage: errorMessage
      }); */
    }
  }
}
