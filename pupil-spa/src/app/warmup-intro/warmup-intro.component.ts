import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { WarmupIntroRendered } from '../services/audit/auditEntry';

@Component({
  selector: 'app-warmup-intro',
  templateUrl: './warmup-intro.component.html',
  styles: []
})
export class WarmupIntroComponent implements OnInit, AfterViewInit {

  constructor(private auditService: AuditService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupIntroRendered());
  }

  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  onClick() {
    this.clickEvent.emit(null);
  }

}
