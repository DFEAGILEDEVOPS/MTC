import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StorageService } from '../services/storage/storage.service';
import { PhaseBannerComponent } from './phase-banner.component';

describe('PhaseBannerComponent', () => {
  let component: PhaseBannerComponent;
  let fixture: ComponentFixture<PhaseBannerComponent>;

  beforeEach(async(() => {
    const injector = TestBed.configureTestingModule({
      declarations: [ PhaseBannerComponent ],
      providers: [
        StorageService,
      ]
    });
    const storageService = injector.get(StorageService);
    injector.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have text tag', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.phase-banner .phase-tag').textContent).toMatch(
      /BETA/
    );
  });

  it('should have text explanation', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.phase-banner span').textContent).toMatch(
      /This is a new service/
    );
  });

  xit('should have link to the feedback page', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.phase-banner span a').textContent).toMatch(
      /feedback/
    );
  });
/* TODO: check feedback link is correct (once we know the path) */
});
