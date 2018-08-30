import { Component } from '@angular/core';
import { APP_CONFIG } from '../services/config/config.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  linkContact;
  linkCookies;

  constructor() {
    this.linkContact = `${APP_CONFIG.apiURL}/contact`;
    this.linkCookies = `${APP_CONFIG.apiURL}/cookies`;  
   }

}
