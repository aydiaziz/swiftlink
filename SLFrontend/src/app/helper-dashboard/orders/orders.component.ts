import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule, NgFor } from '@angular/common';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgFor,CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  errorMessage: string = '';
  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        const userId = localStorage.getItem('user_id');
        this.orders = data
          .filter(o => o.jobStatus !== 'Booked' && o.jobStatus !== 'Completed')
          .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
          .map(o => ({
            ...o,
            isInterested: userId ? o.expressedInterest?.includes(Number(userId)) : false
          }));
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }
  // ✅ Liker un ordre
  expressInterest(order: any): void {
    if (order.isInterested) return;
    this.orderService.likeOrder(order.orderID).subscribe({
      next: () => {
        order.isInterested = true; // update UI directly
      },
      error: (err) => {
        console.error('Error liking order:', err);
        this.errorMessage = 'Failed to like order. Please try again!';
      }
    });
  }
  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return '';
    }
  }
  
}
