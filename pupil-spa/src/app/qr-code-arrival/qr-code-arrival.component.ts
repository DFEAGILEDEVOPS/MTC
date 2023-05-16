import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { ApplicationInsightsService } from '../services/app-insights/app-insights.service';

@Component({
  selector: 'app-qr-code-arrival',
  templateUrl: './qr-code-arrival.component.html'
})
export class QrCodeArrivalComponent implements OnInit {

  constructor(private router: Router,
              private appInsightsService: ApplicationInsightsService) {}

  ngOnInit(): void {
    this.appInsightsService.trackPageView('QR code', '/qr')
    this.router.navigate(['sign-in'])
  }
}
