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
  workforce: Workforce | null;
  client: Client | null;
  invoice: Invoice | null;
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
  activitySummary = { total: 0, scheduled: 0, canceled: 0, confirmedHours: 0, hourlyBaseRate: 0 };
  salesSummary = { totalSales: 0, collectedIsf: 0, pendingPayments: 0, pendingIsf: 0, collectedMembership: 0 };

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
      const contractorName = o.workforce?.lastName || '';
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
  this.adminService.getAllHelpers().subscribe({
    next: (helpers) => {
      const hourlyRates = helpers
        .map(h => Number(h.hourlyRatebyService))
        .filter(rate => !isNaN(rate));

      hourlyRates.sort((a, b) => a - b);

      const totalRates = hourlyRates.reduce((a, b) => a + b, 0);
      const len = hourlyRates.length;

      this.rateSummary.average = len ? totalRates / len : 0;
      this.rateSummary.min = len ? hourlyRates[0] : 0;
      this.rateSummary.max = len ? hourlyRates[len - 1] : 0;
      this.rateSummary.median = len
        ? (len % 2 === 1
            ? hourlyRates[Math.floor(len / 2)]
            : (hourlyRates[len / 2 - 1] + hourlyRates[len / 2]) / 2)
        : 0;

      // Job Status summaries
      const completed = this.filteredOrders.filter(o => o.order.jobStatus === JobStatus.COMPLETED);
      const pending = this.filteredOrders.filter(o => o.order.jobStatus === JobStatus.PENDING);
      const canceled = this.filteredOrders.filter(o => o.order.jobStatus === JobStatus.CANCELED);

      this.activitySummary.total = this.filteredOrders.length;
      this.activitySummary.scheduled = pending.length;
      this.activitySummary.canceled = canceled.length;
      this.activitySummary.confirmedHours = completed.reduce(
        (sum, o) => sum + this.durationToHours(o.invoice?.duration || o.order.orderDuration), 0
      );
      this.activitySummary.hourlyBaseRate = this.selectedContractor
        ? Number(this.selectedContractor.hourlyRatebyService || 0)
        : 0;

      // Sales summary based on invoice statuses
      const paidStatuses = ['paid by cash', 'paid by E-transfer'];
      const pendingStatuses = ['pending', 'Future Payment', 'In Dispute'];

      const paidInvoices = this.filteredOrders
        .map(o => o.invoice)
        .filter(inv => inv && paidStatuses.includes(inv.status || '')) as Invoice[];

      const pendingInvoices = this.filteredOrders
        .map(o => o.invoice)
        .filter(inv => inv && pendingStatuses.includes(inv.status || '')) as Invoice[];

      const totalSales = paidInvoices.reduce((sum, inv) => {
        const base = Number(inv.baseAmount) || 0;
        const hours = this.durationToHours(inv.duration);
        return sum + base * hours;
      }, 0);

      const pendingPayments = pendingInvoices.reduce((sum, inv) => {
        const base = Number(inv.baseAmount) || 0;
        const hours = this.durationToHours(inv.duration);
        return sum + base * hours;
      }, 0);

      const membershipLabels = [
        'pay-per-use',
        'Pay-per-use Fee',
        'Preferred Member- Unlimited bookings',
        'Ultimate Member- Unlimited bookings'
      ];
      const collectedMembership = paidInvoices.reduce((sum, inv) => {
        return sum + (inv.extras ? inv.extras
          .filter(e => membershipLabels.includes(e.label))
          .reduce((s, e) => s + e.price, 0) : 0);
      }, 0);

      this.salesSummary.totalSales = totalSales;
      this.salesSummary.collectedIsf = totalSales * 0.10;
      this.salesSummary.pendingPayments = pendingPayments;
      this.salesSummary.pendingIsf = pendingPayments * 0.10;
      this.salesSummary.collectedMembership = collectedMembership;
    },
    error: (err) => {
      console.error('Failed to fetch helpers for rate summary:', err);
    }
  });
}


  extrasTotal(extras?: Invoice["extras"]): number {
    return extras ? extras.reduce((sum, e) => sum + e.price, 0) : 0;
  }

  invoicedAmount(record: WorkOrderRecord): number {
    return Number(record.invoice?.totalAmount || 0);
  }

  isfAmount(record: WorkOrderRecord): number {
    return Number(record.invoice?.baseAmount || 0) * 0.10;
  }

  private durationToHours(duration?: string | null): number {
    if (!duration) {
      return 0;
    }
    let days = 0;
    let timePart = duration;
    const dayMatch = duration.match(/^(\d+)\s+/);
    if (dayMatch) {
      days = parseInt(dayMatch[1], 10);
      timePart = duration.substring(dayMatch[0].length);
    }
    const parts = timePart.split(":");
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const s = parseInt(parts[2], 10) || 0;
    return days * 24 + h + m / 60 + s / 3600;
  }
}
