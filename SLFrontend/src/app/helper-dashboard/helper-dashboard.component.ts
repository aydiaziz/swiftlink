import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardService } from '../services/dashboard.service';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-helper-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    NgChartsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterOutlet
  ],
  templateUrl: './helper-dashboard.component.html',
  styleUrls: ['./helper-dashboard.component.css']
})
export class HelperDashboardComponent  {
  

  constructor(
    
  ) {
    Chart.register(...registerables);
  }

  


  

  

 


}