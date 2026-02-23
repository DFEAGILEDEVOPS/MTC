import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../services/device/device.service'
import { Router } from '@angular/router'

@Component({
    selector: 'app-error-localstorage',
    templateUrl: './error-local-storage.component.html',
    styleUrls: ['./error-local-storage.component.scss'],
    standalone: false
})
export class ErrorLocalStorageComponent implements OnInit {

  constructor(private router: Router,
              private deviceService: DeviceService) {

  }

  ngOnInit(): void {
    // If the teacher has fixed the local storage issue and refreshed the page, we need to navigate back to the sign-in page.
    if (this.deviceService.isLocalStorageEnabled()) {
      this.router.navigate(['sign-in'])
    }
  }
}
