import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStats, Job, DashboardResponse } from '../../models/dashboard.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('incomeChart') incomeChartRef!: ElementRef;

  statsCards = [
    { title: 'Travaux Totaux', value: 0, type: 'number' },
    { title: 'Ce Mois', value: 0, type: 'number' },
    { title: 'Revenu Total', value: 0, type: 'currency' }
  ];

  upcomingJobs: Job[] = [];
  loading = true;
  errorMessage = '';
  helperServiceTypes: string[] = [];
  orders: any[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadData();
    this.loadHelperServiceTypes();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  loadData(): void {
    this.dashboardService.getStats().subscribe({
      next: (data: DashboardResponse) => {
        this.statsCards[0].value = data.stats.total_orders;
        this.statsCards[1].value = data.stats.monthly_completed;
        this.statsCards[2].value = data.stats.total_income;
        this.upcomingJobs = data.upcoming_jobs.map(job => ({
          ...job,
          date: new Date(job.date)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        this.loading = false;
        
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']); // Meilleure pratique que window.location
        }
      }
    });
  }

  loadHelperServiceTypes(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.role === 'Workforce' && user.workCategory?.length > 0) {
          this.helperServiceTypes = user.workCategory.map((category: any) => category.name);
          this.loadOrders();
        } else {
          this.errorMessage = 'Aucun type de service trouvé pour ce helper';
        }
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.errorMessage = 'Échec du chargement des données utilisateur';
      }
    });
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.errorMessage = 'Échec du chargement des commandes';
      }
    });
  }

  initChart(): void {
    if (!this.incomeChartRef?.nativeElement) {
      setTimeout(() => this.initChart(), 100);
      return;
    }
  
    const ctx = this.incomeChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
  
    // Calcul des 6 derniers mois de revenus
    const monthlyIncomes = this.calculateLastSixMonthsIncome();
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLastSixMonthsLabels(),
        datasets: [{
          label: 'Revenus mensuels',
          data: monthlyIncomes,
          borderColor: '#002f5f',
          backgroundColor: 'rgba(0, 47, 95, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#002f5f',
              font: {
                weight: 'bold'
              }
            }
          },
          tooltip: {
            backgroundColor: '#002f5f',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            callbacks: {
              label: (context) => {
                return ` $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#002f5f',
              callback: (value) => `$${value}`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#002f5f'
            }
          }
        }
      }
    });
  }
  private calculateLastSixMonthsIncome(): number[] {
    // Implémentation basique - à adapter avec vos vraies données
    if (!this.upcomingJobs?.length) return [0, 0, 0, 0, 0, 0];
    
    // Exemple: utilisez les revenus du composant ou calculez-les
    return [
      this.statsCards[2].value * 0.8, // Mois -6
      this.statsCards[2].value * 0.9, // Mois -5
      this.statsCards[2].value * 1.0, // Mois -4
      this.statsCards[2].value * 1.1, // Mois -3
      this.statsCards[2].value * 1.2, // Mois -2
      this.statsCards[2].value        // Mois courant
    ];
  }
  
  private getLastSixMonthsLabels(): string[] {
    const months = [];
    const date = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }
    
    return months;
  }
}