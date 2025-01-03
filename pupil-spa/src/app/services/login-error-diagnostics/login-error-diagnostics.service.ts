import { Injectable } from '@angular/core';
import { LoginErrorService } from '../login-error/login-error.service';
import { APP_CONFIG } from '../config/config.service';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { WindowRefService} from '../window-ref/window-ref.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginErrorDiagnosticsService {

  protected window: any;
  isBrowserStatusOnline: boolean;

  constructor(
    private http: HttpClient,
    private loginErrorService: LoginErrorService,
    private windowRefService: WindowRefService
  ) {
    this.window = this.windowRefService.nativeWindow;
    this.isBrowserStatusOnline = this.window.navigator.onLine;
  }

  async process(err: any) {
    if (err.status !== 0) {
      return;
    }
    if (!this.isBrowserStatusOnline) {
      this.loginErrorService.changeMessage('Internet disconnected');
      return;
    }
    const canAccessAuthURL = await this.canAccessURL(`${APP_CONFIG.apiBaseUrl}/ping`);
    if (!canAccessAuthURL) {
      this.loginErrorService.changeMessage(`Connection refused to ${APP_CONFIG.apiBaseUrl}/ping`);
    }
  }

  private async canAccessURL(url: string): Promise<boolean> {
    try {
      await lastValueFrom(
        this.http.get(url, { observe: 'response' })
          .pipe(first())
      )
      return true
    } catch {
      return false
    }
  }
}
