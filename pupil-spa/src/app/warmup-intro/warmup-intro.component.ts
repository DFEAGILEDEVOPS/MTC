import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { WarmupIntroRendered } from '../services/audit/auditEntry';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
  selector: 'app-warmup-intro',
  templateUrl: './warmup-intro.component.html',
  styles: []
})
export class WarmupIntroComponent implements OnInit, AfterViewInit {

  /**
   * Emit when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  protected window: any;

  constructor(private auditService: AuditService, protected windowRefService: WindowRefService) {
    this.window = windowRefService.nativeWindow;
  }

  ngOnInit() {
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/practice-questions'
    });
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupIntroRendered());
  }

  onClick() {
    this.clickEvent.emit(null);
  }

}
