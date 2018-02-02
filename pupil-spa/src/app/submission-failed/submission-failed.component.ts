import { Component, OnInit } from '@angular/core';
import { CheckSubmissionFailed } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-submission-failed',
  templateUrl: './submission-failed.component.html',
  styleUrls: ['./submission-failed.component.scss']
})
export class SubmissionFailedComponent implements OnInit {

  public supportNumber: string;

  constructor(private auditService: AuditService) {
    this.supportNumber = environment.supportNumber;
  }

  ngOnInit() {
    this.auditService.addEntry(new CheckSubmissionFailed());
  }

}
