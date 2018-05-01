import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { AuditService } from './services/audit/audit.service';
import { AppError } from './services/audit/auditEntry';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';


@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  protected window: any;

  constructor(private injector: Injector) { }

  handleError(error) {
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
  }
}
