import { ErrorHandler, Injectable} from '@angular/core';
import { WindowRefService } from './services/window-ref/window-ref.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  protected window: any;

  constructor(protected windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
  }
  handleError(error) {
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/error'
    });
    throw error;
  }
}
