import { Injectable } from '@angular/core';
import { LoginErrorService } from '../login-error/login-error.service';
import { APP_CONFIG } from '../config/config.service';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { WindowRefService} from '../window-ref/window-ref.service';

@Injectable()
export class LoginErrorDiagnosticsService {

  protected window: any;

  constructor(
    private http: HttpClient,
    private loginErrorService: LoginErrorService,
    private windowRefService: WindowRefService
  ) {
    this.window = windowRefService.nativeWindow;
  }

  async process(err) {
    if (err.status !== 0) {
      return;
    }
    const isBrowserStatusOnline = this.window.navigator.onLine;
    if (!isBrowserStatusOnline) {
      this.loginErrorService.changeMessage('Internet disconnected');
      return;
    }
    const canAccessAuthURL = await this.canAccessURL(APP_CONFIG.authURL);
    if (!canAccessAuthURL) {
      this.loginErrorService.changeMessage(`Connection refused to ${APP_CONFIG.authURL}`);
    }
  }

  async canAccessURL(url) {
    return new Promise(async (resolve) => {
      await this.http.get(url, { observe: 'response' })
        .pipe(first())
        .toPromise()
        .then(data => {
          return resolve(true);
        })
        .catch(error => {
          return resolve(error.status !== 0);
        });
    });
  }
}
