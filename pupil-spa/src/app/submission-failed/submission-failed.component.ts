import { Component, OnInit } from '@angular/core';
import { CheckSubmissionFailed } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-submission-failed',
  templateUrl: './submission-failed.component.html',
  styleUrls: ['./submission-failed.component.scss']
})
export class SubmissionFailedComponent implements OnInit {

  public supportNumber: string;
  protected window: any;

  constructor(private auditService: AuditService, protected windowRefService: WindowRefService) {
    this.supportNumber = environment.supportNumber;
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.auditService.addEntry(new CheckSubmissionFailed());
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/submission-failed'
    });
  }

}
