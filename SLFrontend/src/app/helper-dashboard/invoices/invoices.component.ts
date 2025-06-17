import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-helper-invoices',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  statuses = [
    'paid by E-transfer',
    'paid by cash',
    'Future Payment',
    'In Dispute'
  ];

  constructor(private invoiceService: InvoiceService, private router: Router) {}

  ngOnInit() {
    this.invoiceService.getHelperInvoices().subscribe(data => {
      this.invoices = data;
    });
  }

  updateStatus(inv: any) {
    this.invoiceService.updateInvoiceStatus(inv.invoiceID, inv.status).subscribe();
  }

  viewInvoice(inv: any) {
    this.router.navigate(['/helper-dashboard/invoices', inv.invoiceID]);
  }
}
