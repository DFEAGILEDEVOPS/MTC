import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { CheckCompleteRendered } from '../services/audit/auditEntry';

@Component({
  selector: 'app-check-complete',
  templateUrl: './check-complete.component.html',
  styleUrls: ['./check-complete.component.css']
})
export class CheckCompleteComponent implements OnInit, AfterViewInit {

  constructor(private auditService: AuditService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new CheckCompleteRendered());
  }

}
