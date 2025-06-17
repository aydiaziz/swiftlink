import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-helper-invoice-detail',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.css'
})
export class InvoiceDetailsComponent implements OnInit {
  invoice: any;
  isf = 0;
  platformFee = 0;
  payPerUse = 0;
  totalDue = 0;

  constructor(private route: ActivatedRoute, private invoiceService: InvoiceService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getInvoice(+id).subscribe(data => {
        this.invoice = data;
        this.calculateFees();
      });
    }
  }

  calculateFees() {
    const amount = parseFloat(this.invoice.totalAmount);
    this.isf = amount * 0.10;
    this.platformFee = amount * 0.10;
    const ppu = this.invoice.extras?.find((e: any) => e.label === 'Pay-per-use Fee');
    this.payPerUse = ppu ? parseFloat(ppu.price) : 0;
    this.totalDue = amount + this.isf + this.platformFee;
  }
}
