import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { APP_CONFIG } from './services/config/config.service';

@Injectable()
export class ConnectivityCheckGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate() {
    if (!APP_CONFIG.testPupilConnectionEnabled) {
      this.router.navigate(['/sign-in']);
      return;
    }
    return true;
  }
}
