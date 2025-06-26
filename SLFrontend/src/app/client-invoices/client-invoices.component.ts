import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { InvoiceService } from '../services/invoice.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './client-invoices.component.html',
  styleUrl: './client-invoices.component.css'
})
export class ClientInvoicesComponent implements OnInit {
  invoices: any[] = [];
  bookedOrders: any[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.invoiceService.getClientInvoices().subscribe(data => {
      this.invoices = data;
    });

    this.orderService.getClientBookedOrders().subscribe(data => {
      this.bookedOrders = data;
    });
  }

  viewInvoice(id: number) {
    this.router.navigate(['/invoices', id]);
  }
}
