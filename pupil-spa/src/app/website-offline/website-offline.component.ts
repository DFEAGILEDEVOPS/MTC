import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../services/config/config.service';

@Component({
    selector: 'app-website-offline',
    templateUrl: './website-offline.component.html',
    styleUrls: ['./website-offline.component.scss'],
    standalone: false
})

export class WebsiteOfflineComponent implements OnInit {
  public title: string;

  constructor(private router: Router) { }

  ngOnInit() {
    if (!APP_CONFIG.websiteOffline) {
      this.router.navigate(['/']);
    }
    this.title = 'Multiplication Tables Check';
  }
}
