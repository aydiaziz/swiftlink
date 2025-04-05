import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthyIncomeComponent } from './monthy-income.component';

describe('MonthyIncomeComponent', () => {
  let component: MonthyIncomeComponent;
  let fixture: ComponentFixture<MonthyIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthyIncomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthyIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
