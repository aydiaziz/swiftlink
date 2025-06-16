import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrdersComponent } from './work-orders.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderService } from '../../services/order.service';

describe('WorkOrdersComponent', () => {
  let component: WorkOrdersComponent;
  let fixture: ComponentFixture<WorkOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrdersComponent, HttpClientTestingModule],
      providers: [OrderService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
