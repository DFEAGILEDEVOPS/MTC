import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { ApplicationInsightsService } from '../services/app-insights/app-insights.service';
import { QrCodeUsageService } from '../services/qr-code-usage/qr-code-usage.service';

@Component({
  selector: 'app-qr-code-arrival',
  templateUrl: './qr-code-arrival.component.html'
})
export class QrCodeArrivalComponent implements OnInit {
  constructor(private router: Router,
              private appInsightsService: ApplicationInsightsService,
              private qrCodeUsageService: QrCodeUsageService) {}

  ngOnInit(): void {
    this.appInsightsService.trackPageView('QR code', '/qr')
    // Track the QR Code was used to access this page.  This stores the arrival in memory, to be
    // written out as events after the
    this.qrCodeUsageService.qrCodeArrival()
    this.router.navigate(['sign-in'])
  }
}
