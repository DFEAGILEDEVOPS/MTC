import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { CheckComplete } from '../services/audit/auditEntry';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
})
export class CheckCompleteComponent implements OnInit {

  constructor(private auditService: AuditService) {
  }

  ngOnInit() {
    this.auditService.addEntry(new CheckComplete());
  }

}
