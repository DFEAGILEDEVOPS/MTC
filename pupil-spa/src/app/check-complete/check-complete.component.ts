import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { CheckComplete } from '../services/audit/auditEntry';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
})
export class CheckCompleteComponent implements OnInit {

  protected window: any;

  constructor(private auditService: AuditService, protected windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.auditService.addEntry(new CheckComplete());
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/check-complete'
    });
  }

}
