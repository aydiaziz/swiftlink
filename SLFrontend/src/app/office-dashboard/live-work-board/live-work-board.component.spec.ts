import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveWorkBoardComponent } from './live-work-board.component';

describe('LiveWorkBoardComponent', () => {
  let component: LiveWorkBoardComponent;
  let fixture: ComponentFixture<LiveWorkBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveWorkBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveWorkBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
