import { ErrorHandler, Injectable} from '@angular/core';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { AuditService } from './services/audit/audit.service';
import { AppError } from './services/audit/auditEntry';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  protected window: any;

  constructor(protected windowRefService: WindowRefService,
              private auditService: AuditService) {
    this.window = windowRefService.nativeWindow;
  }
  handleError(error) {
    this.auditService.addEntry(
      new AppError({
        errorMessage: error.message
      }
    ));

    this.window.ga('send', {
      hitType: 'pageview',
      page: '/error'
    });
  }
}
