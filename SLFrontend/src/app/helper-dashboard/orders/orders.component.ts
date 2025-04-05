import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule, NgFor } from '@angular/common';

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
      next: (data) => this.orders = data,
      error: (err) => console.error('Error loading orders:', err)
    });
  }
  // ✅ Liker un ordre
  likeOrder(orderID: number): void {
    this.orderService.likeOrder(orderID).subscribe({
      next: () => {
        console.log(`Order ${orderID} liked!`);
        this.loadOrders();  // 🔄 Rafraîchir les ordres après le like
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
