import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import { WarmupCompleteRendered } from '../services/audit/auditEntry';

@Component({
  selector: 'app-warmup-complete',
  templateUrl: './warmup-complete.component.html',
  styles: []
})
export class WarmupCompleteComponent implements OnInit, AfterViewInit {

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  constructor(private auditService: AuditService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupCompleteRendered());
  }

  onClick() {
    // console.log(`warmup-complete(): onClick called()`);
    this.clickEvent.emit(null);
  }

}
