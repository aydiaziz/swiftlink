import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { InvoiceService } from '../../services/invoice.service';

import { DashboardStats, Job, DashboardResponse } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('incomeChart') incomeChartRef!: ElementRef;

  statsCards = [
    { title: 'Total Works', value: 0, type: 'number' },
    { title: 'This Month', value: 0, type: 'number' },
    { title: 'Total income', value: 0, type: 'currency' }
  ];

  upcomingJobs: Job[] = [];
  loading = true;
  errorMessage = '';
  helperServiceTypes: string[] = [];
  orders: any[] = [];
  invoiceStatusMap: { [orderId: number]: string } = {};
  monthlyIncomeMap: { [key: string]: number } = {};
  chartInstance: Chart | null = null;
  baseRate = 0;
  selectedFilter: 'today' | 'all' | 'range' = 'today';
  fromDate = '';
  toDate = '';
  summary = {
    totalWorkOrders: 0,
    confirmedHours: 0,
    basePayouts: 0,
    isf: 0,
    workExpenses: 0
  };
  private readonly monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private invoiceService: InvoiceService,
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
        // ✅ store the income data map
        this.monthlyIncomeMap = data.stats.monthly_income || {};
        
        // Continue with the rest...
        this.statsCards[0].value = data.stats.total_orders;
        this.statsCards[1].value = data.stats.monthly_completed;
        this.statsCards[2].value = data.stats.total_income;
        this.upcomingJobs = data.upcoming_jobs.map(job => ({
          ...job,
          date: new Date(job.date)
        }));
        this.loading = false;
    
        // Re-init chart if needed
        this.initChart();
      }
    });
  }

  loadHelperServiceTypes(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.baseRate = user.workforce?.hourlyRatebyService || 0;

        // The backend assigns the "3rd Party" role to helpers. Accept it here
        // so we properly load orders for helpers.
        const isHelper = user.role === 'Workforce' || user.role === '3rd Party';

        if (isHelper && user.workforce?.workCategory?.length > 0) {
          // workCategory comes from the workforce object and may be a list of
          // IDs; keep it as-is for now.
          this.helperServiceTypes = user.workforce.workCategory.map((category: any) => category.name || category);
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
          this.invoiceService.getHelperInvoices().subscribe({
            next: (invoices) => {
              this.invoiceStatusMap = {};
              invoices.forEach((inv: any) => {
                const orderId = inv.orderID || inv.order;
                if (orderId !== undefined && orderId !== null) {
                  this.invoiceStatusMap[orderId] = inv.status;
                }
              });
              this.calculateSummary();
            },
          error: () => {
            this.calculateSummary();
          }
        });
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
  
    // 🔥 Important : détruire l'ancien graphique
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  
    const monthlyIncomes = this.calculateLastSixMonthsIncome();
    const labels = this.getLastSixMonthsLabels();
  
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Monthly income',
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
        maintainAspectRatio: false, // autorise les dimensions personnalisées
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#002f5f',
              font: { weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: '#002f5f',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: (context) => ` $${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#002f5f' },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            ticks: { color: '#002f5f' },
            grid: { display: false }
          }
        }
      }
    });
  }
  calculateLastSixMonthsIncome(): number[] {
    const last6Keys = this.getLastSixMonthsLabelsRaw();
    return last6Keys.map(monthKey => this.monthlyIncomeMap[monthKey] || 0);
  }

  getLastSixMonthsLabels(): string[] {
    const raw = this.getLastSixMonthsLabelsRaw();
    return raw.map(key => {
      const [year, month] = key.split('-').map(Number);
      return `${this.monthNames[month - 1]} ${year}`;
    });
  }

  getLastSixMonthsLabelsRaw(): string[] {
    const labels = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      labels.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    return labels;
  }

  applyFilter(): void {
    this.calculateSummary();
  }

  get filteredOrders(): any[] {
    let filtered = this.orders.filter(o => Array.isArray(o.assignedTo) ? o.assignedTo.includes(localStorage.getItem('user_id')) : true);
    if (this.selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(o => o.executionDate && o.executionDate.startsWith(today));
    } else if (this.selectedFilter === 'range' && this.fromDate && this.toDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      filtered = filtered.filter(o => {
        if (!o.executionDate) return false;
        const d = new Date(o.executionDate);
        return d >= from && d <= to;
      });
    }
    return filtered;
  }

  calculateSummary(): void {
    const orders = this.filteredOrders;
    this.summary.totalWorkOrders = orders.length;
    let totalHours = 0;
    orders.forEach(o => {
      if (o.orderDuration) {
        totalHours += this.parseDuration(o.orderDuration);
      }
    });
    this.summary.confirmedHours = totalHours;
    this.summary.basePayouts = this.baseRate * totalHours;
    this.summary.isf = this.summary.basePayouts * 0.10;
    this.summary.workExpenses = 0; // requires invoice data
  }

  /**
   * Convert a duration string (e.g. "01:30:00") to hours.
   *
   * Some orders may not have a duration defined. In those cases the
   * parameter can be `null` or `undefined`, so guard against that to
   * avoid runtime errors when `split` is called on a falsy value.
   */
  parseDuration(duration?: string | null): number {
    if (!duration) {
      return 0;
    }

    const parts = duration.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const s = parseInt(parts[2] || '0', 10) || 0;
      return h + m / 60 + s / 3600;
    }

    return 0;
  }
}
