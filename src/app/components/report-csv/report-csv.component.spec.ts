import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCsvComponent } from './report-csv.component';

describe('ReportCsvComponent', () => {
  let component: ReportCsvComponent;
  let fixture: ComponentFixture<ReportCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCsvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
