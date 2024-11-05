import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { AuditService } from './services/audit/audit.service';
import { AuditEntryFactory } from './services/audit/auditEntry'
import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import { APP_CONFIG } from './services/config/config.service';
import { ApplicationInsightsService } from './services/app-insights/app-insights.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  protected window: any;

  constructor(private injector: Injector,
              private auditEntryFactory: AuditEntryFactory
  ) { }

  handleError(error: any) {
    if (console && console.log) {
      console.log('Global error handler: ', error);
    }

    // Pick up our dependencies.  Don't use dependency injection - so this module can be loaded first.
    const auditService = this.injector.get(AuditService);
    const location = this.injector.get(LocationStrategy);

    // Get the error details
    const errorMessage =  error.message ? error.message : error.toString();
    const url = location instanceof PathLocationStrategy ? location.path() : '';

    const data = {
      errorMessage,
      url,
      stackTrace: error.stack
    }
    auditService.addEntry(this.auditEntryFactory.createAppError(data));

    if (APP_CONFIG.applicationInsightsConnectionString !== '') {
      // using injector directly to avoid recursive errors...
      const appInsightsService = this.injector.get(ApplicationInsightsService);
      appInsightsService.trackException(error);
      appInsightsService.trackPageView('error', '/error');
    }
  }
}
