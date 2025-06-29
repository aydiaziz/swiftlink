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
  membershipFee = 0;
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
    const hours = this.durationToHours(this.invoice.duration);
    const rate = parseFloat(this.invoice.unitPrice);
    this.isf = rate * hours * 0.10;
    this.platformFee = rate * hours * 0.10;

    const membershipLabels = [
      'Pay-per-use Fee',
      'pay-per-use',
      'Preferred Member- Unlimited bookings',
      'Ultimate Member- Unlimited bookings'
    ];
    const membership = this.invoice.extras?.find((e: any) => membershipLabels.includes(e.label));
    this.membershipFee = membership ? parseFloat(membership.price) : 0;

    this.totalDue = this.isf + this.platformFee + this.membershipFee;
  }

  private durationToHours(duration?: string | number | null): number {
    if (duration == null) {
      return 0;
    }
    if (typeof duration === 'number') {
      return duration;
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
