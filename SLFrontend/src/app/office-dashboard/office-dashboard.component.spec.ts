import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeDashboardComponent } from './office-dashboard.component';

describe('OfficeDashboardComponent', () => {
  let component: OfficeDashboardComponent;
  let fixture: ComponentFixture<OfficeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficeDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
