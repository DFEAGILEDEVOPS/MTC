import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConnectivityService } from '../services/connectivity-service/connectivity-service';
import { APP_CONFIG } from '../services/config/config.service';
import { CheckStatusService } from '../services/check-status/check-status.service';

@Component({
  selector: 'app-connectivity-check',
  templateUrl: './connectivity-check.component.html',
  styleUrls: ['./connectivity-check.component.scss']
})
export class ConnectivityCheckComponent implements OnInit {

  connectivityCheckViewMinDisplay;

  constructor(
    private connectivityService: ConnectivityService,
    private router: Router,
    private checkStatusService: CheckStatusService
  ) {
    const { connectivityCheckViewMinDisplay } = APP_CONFIG;
    this.connectivityCheckViewMinDisplay = connectivityCheckViewMinDisplay;
  }

  /**
   * Sleep function (milliseconds) to provide minimal display time for submission pending screen
   * @param {Number} ms
   * @returns {Promise.<void>}
   */
  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async ngOnInit() {
    const hasUnfinishedCheck = this.checkStatusService.hasUnfinishedCheck();
    if (hasUnfinishedCheck) {
      return this.router.navigate(['check'], { queryParams: { unfinishedCheck: true } });
    }
    const startTime = Date.now();
    let connectivityCheckSucceeded;
    try {
      connectivityCheckSucceeded = await this.connectivityService.connectivityCheckSucceeded();
    } catch (err) {
    }
    if (connectivityCheckSucceeded) {
      await this.displayMinTime(startTime);
      return this.router.navigate(['/sign-in']);
    } else {
      await this.displayMinTime(startTime);
      return this.router.navigate(['/connectivity-error']);
    }
  }

  async displayMinTime(startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const minDisplay = this.connectivityCheckViewMinDisplay;
    if (duration < minDisplay) {
      const displayTime = minDisplay - duration;
      return this.sleep(displayTime);
    }
  }
}
