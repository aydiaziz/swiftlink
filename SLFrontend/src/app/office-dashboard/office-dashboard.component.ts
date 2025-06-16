import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgChartsModule } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-office-dashboard',
  standalone: true,
  imports: [    CommonModule,SidebarComponent,
      NgChartsModule,
      MatProgressSpinnerModule,
      MatIconModule,
      RouterOutlet],
  templateUrl: './office-dashboard.component.html',
  styleUrl: './office-dashboard.component.css'
})
export class OfficeDashboardComponent {

}
