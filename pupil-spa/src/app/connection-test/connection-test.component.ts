import { Component, OnInit} from '@angular/core';
import { StorageService } from '../services/storage/storage.service';
import { ConnectionTestService } from '../services/connection-test/connection-test.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.component.html',
  styleUrls: ['./connection-test.component.scss']
})
export class ConnectionTestComponent implements OnInit {
  constructor(
    private storageService: StorageService,
    private connectionTestService: ConnectionTestService) {

    // reset the feedback and preview flags when starting the test
    this.storageService.setItem('feedback_given', false);
    this.storageService.setItem('preview_completed', false);
  }

  async ngOnInit() {
    // setTimeout needed as 'rendering' seems to be blocked in some browsers otherwise
    setTimeout(() => this.connectionTestService.startTest(), 1000);
  }
}
