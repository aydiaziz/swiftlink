import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, JobStatus } from '../../models/order.model';
import { Workforce, Client } from '../../models/user.model';
import { Invoice } from '../../models/invoice.model';
import { OrderService } from '../../services/order.service';
import { AdminService } from '../../services/admin.service';

interface WorkOrderRecord {
  order: Order & {
    clientNotes: string;
    finalWorkDescription?: string;
    contractorNotes?: string;
  };
  workforce: Workforce;
  client: Client;
  invoice: Invoice;
}

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-orders.component.html',
  styleUrl: './work-orders.component.css'
})
export class WorkOrdersComponent implements OnInit {
  workOrders: WorkOrderRecord[] = [];

  contractors: Workforce[] = [];

  filteredOrders: WorkOrderRecord[] = [];

  dateFilter: 'today' | 'all' | 'range' = 'today';
  fromDate = '';
  toDate = '';
  selectedContractor: Workforce | null = null;

  rateSummary = { median: 0, average: 0, max: 0, min: 0 };
  activitySummary = { total: 0, scheduled: 0, canceled: 0, confirmedHours: 0 };
  salesSummary = { totalSales: 0, collectedIsf: 0, pendingPayments: 0, pendingIsf: 0 };

  constructor(private orderService: OrderService,private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
    this.adminService.getAllHelpers().subscribe({
    next: (helpers) => {
      this.contractors = helpers;
    },
    error: (err) => {
      console.error('Failed to load helpers:', err);
    }
  });
  }

  private loadData(): void {
    this.orderService.getWorkOrdersDashboard().subscribe(data => {
      this.workOrders = data as WorkOrderRecord[];
      
      this.filteredOrders = [...this.workOrders];
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const todayStr = new Date().toDateString();
    this.filteredOrders = this.workOrders.filter(o => {
      const contractorName = o.workforce.lastName;
      const orderDate = new Date(o.order.executionDate || o.order.creationDate);
      const matchContractor = this.selectedContractor ? contractorName === this.selectedContractor.lastName : true;
      const matchDate = this.dateFilter === 'all'
        ? true
        : this.dateFilter === 'today'
          ? orderDate.toDateString() === todayStr
          : (!!this.fromDate && !!this.toDate
              ? orderDate >= new Date(this.fromDate) && orderDate <= new Date(this.toDate)
              : true);
      return matchContractor && matchDate;
    });

    this.calculateSummaries();
  }

  calculateSummaries(): void {
    const allRates = Array.from(new Set(this.workOrders.map(o => o.workforce.hourlyRatebyService || 0)));
    allRates.sort((a, b) => a - b);
    const totalRates = allRates.reduce((a, b) => a + b, 0);
    this.rateSummary.average = allRates.length ? totalRates / allRates.length : 0;
    this.rateSummary.max = allRates.length ? allRates[allRates.length - 1] : 0;
    this.rateSummary.min = allRates.length ? allRates[0] : 0;
    this.rateSummary.median = allRates.length ? (allRates.length % 2 === 1 ? allRates[Math.floor(allRates.length / 2)] : (allRates[allRates.length / 2 - 1] + allRates[allRates.length / 2]) / 2) : 0;

    const completed = this.filteredOrders.filter(o => o.order.jobStatus === JobStatus.COMPLETED);
    const pending = this.filteredOrders.filter(o => o.order.jobStatus === JobStatus.PENDING);
    const canceled = this.filteredOrders.filter(o => o.order.jobStatus === JobStatus.CANCELED);

    this.activitySummary.total = completed.length;
    this.activitySummary.scheduled = pending.length;
    this.activitySummary.canceled = canceled.length;
    this.activitySummary.confirmedHours = completed.reduce((sum, o) => sum + (Number(o.order.orderDuration) || 0), 0);

    const totalSales = this.filteredOrders.reduce((sum, o) => sum + o.invoice.totalAmount, 0);
    const pendingPayments = pending.length * this.rateSummary.average;

    this.salesSummary.totalSales = totalSales;
    this.salesSummary.collectedIsf = totalSales * 0.10;
    this.salesSummary.pendingPayments = pendingPayments;
    this.salesSummary.pendingIsf = pendingPayments * 0.10;

  }

  extrasTotal(extras: Invoice["extras"]): number {
    return extras.reduce((sum, e) => sum + e.price, 0);
  }

  invoicedAmount(record: WorkOrderRecord): number {
    const hours = Number(record.order.orderDuration) || 0;
    const rate = record.workforce.hourlyRatebyService || 0;
    return hours * rate;
  }
}
