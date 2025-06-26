import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../services/invoice.service';
import { RatingService } from '../services/rating.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit {
  invoice: any;
  durationHours = 0;
  hourlyRateWithFee = 0;
  labourTotalWithFee = 0;
  extrasTotal = 0;
  grandTotal = 0;
  rating = 0;
  comment = '';

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getInvoice(+id).subscribe(data => {
        this.invoice = data;
        this.durationHours = this.calculateHours(this.invoice.duration);
        this.calculateTotals();
      });
    }
  }

  calculateHours(duration: string): number {
    if (!duration) {
      return 0;
    }
    const parts = duration.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    return +(h + m / 60 + s / 3600).toFixed(2);
  }

  copyToClipboard(text: any) {
    navigator.clipboard.writeText(String(text));
  }

  calculateTotals() {
    if (!this.invoice) {
      return;
    }
    const unit = parseFloat(this.invoice.unitPrice);
    const base = parseFloat(this.invoice.baseAmount);
    this.hourlyRateWithFee = +(unit * 1.2).toFixed(2);
    this.labourTotalWithFee = +(base * 1.2).toFixed(2);
    if (Array.isArray(this.invoice.extras)) {
      this.extrasTotal = this.invoice.extras.reduce(
        (sum: number, e: any) => sum + parseFloat(e.price),
        0
      );
    }
    this.grandTotal = +(this.labourTotalWithFee + this.extrasTotal).toFixed(2);
  }

  setRating(star: number) {
    this.rating = star;
  }

  submitRating() {
    const data = {
      invoice: this.invoice.invoiceID,
      rating: this.rating,
      comment: this.comment
    };
    this.ratingService.submitRating(data).subscribe({
      next: () => alert('Rating submitted!'),
      error: () => alert('Failed to submit rating.')
    });
  }
}
