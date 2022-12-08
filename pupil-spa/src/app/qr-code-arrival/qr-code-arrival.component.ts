import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'qr-code-arrival',
  templateUrl: './qr-code-arrival.component.html'
})
export class QrCodeArrivalComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['sign-in'])
  }
}
