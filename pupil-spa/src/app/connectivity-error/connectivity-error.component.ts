import { Component, OnInit } from '@angular/core';
import { ConnectivityService } from '../services/connectivity-service/connectivity-service';

@Component({
  selector: 'app-connectivity-error',
  templateUrl: './connectivity-error.component.html',
  styleUrls: ['./connectivity-error.component.scss']
})
export class ConnectivityErrorComponent implements OnInit {

  public serviceErrorMessage;

  constructor(
    private connectivityService: ConnectivityService
  ) { }

  ngOnInit() {
    this.connectivityService.currentConnectivityMessageSource.subscribe(message => this.serviceErrorMessage = message);
  }
}
