import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from '../services/audit/audit.service';
import { WarmupStarted } from '../services/audit/auditEntry';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-practice-instructions',
  templateUrl: './practice-instructions.component.html',
  styleUrls: ['./practice-instructions.component.scss']
})
export class PracticeInstructionsComponent implements OnInit {

  protected window: any;

  constructor(
    private router: Router,
    private auditService: AuditService,
    protected windowRefService: WindowRefService,
  ) {
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/practice-instructions'
    });
  }

  onClick() {
    this.auditService.addEntry(new WarmupStarted());
    this.router.navigate(['check']);
  }

}
