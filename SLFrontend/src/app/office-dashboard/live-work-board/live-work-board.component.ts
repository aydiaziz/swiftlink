import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule, NgFor } from '@angular/common';
@Component({
  selector: 'app-live-work-board',
  standalone: true,
  imports: [NgFor,CommonModule],
  templateUrl: './live-work-board.component.html',
  styleUrl: './live-work-board.component.css'
})
export class LiveWorkBoardComponent implements OnInit {
  orders: any[] = [];
  activeUnassigned: any[] = [];
  activeAssigned: any[] = [];
  pastOrders: any[] = [];
  expandedOrderId: number | null = null;
  errorMessage: string = '';
  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getWorkOrdersDashboard().subscribe({
      next: (data) => {
        this.orders = data;
        this.activeUnassigned = this.orders.filter(o => o.order.jobStatus !== 'Completed' && (!o.order.assignedTo || o.order.assignedTo.length === 0));
        this.activeAssigned = this.orders.filter(o => o.order.jobStatus === 'Booked' );
        this.pastOrders = this.orders.filter(o => o.order.jobStatus === 'Completed');
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }
  // ✅ Liker un ordre
  likeOrder(orderID: number): void {
    this.orderService.likeOrder(orderID).subscribe({
      next: () => {
        
        this.loadOrders();  // 🔄 Rafraîchir les ordres après le like
      },
      error: (err) => {
        console.error('Error liking order:', err);
        this.errorMessage = 'Failed to like order. Please try again!';
      }
    });
  }

  toggleOrder(orderID: number): void {
    this.expandedOrderId = this.expandedOrderId === orderID ? null : orderID;
  }
  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return '';
    }
  }

  trackById(index: number, item: any): number {
    return item.order?.orderID;
  }

}