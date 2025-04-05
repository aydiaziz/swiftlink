import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricOrdersComponent } from './historic-orders.component';

describe('HistoricOrdersComponent', () => {
  let component: HistoricOrdersComponent;
  let fixture: ComponentFixture<HistoricOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
