import { Component } from '@angular/core';
import { APP_CONFIG } from '../services/config/config.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  private linkCookies: String;

  constructor() {
    this.linkCookies = `${APP_CONFIG.apiURL}/cookies`;
  }
}
