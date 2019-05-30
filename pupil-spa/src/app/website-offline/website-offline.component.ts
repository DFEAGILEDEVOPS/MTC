import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_CONFIG } from '../services/config/config.service';

@Component({
  selector: 'app-website-offline',
  templateUrl: './website-offline.component.html',
  styleUrls: ['./website-offline.component.scss']
})

export class WebsiteOfflineComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }
  
  ngOnInit() {
    if (!APP_CONFIG.websiteOffline) {
      this.router.navigate(['/'])
    }
  }

}
