import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [NgFor,FormsModule,CommonModule ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit {
  invoice: any = null;
  newExtra = { label: '', price: 0 };
  membershipExtra: any = null;
  totalAmount: number = 0;
  isSending: boolean = false;
  unitPriceWithFee = 0;
  baseAmountWithFee = 0;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.invoiceService.initInvoice(orderId).subscribe(res => {
        this.invoice = res;
        if (Array.isArray(this.invoice.extras)) {
          const idx = this.invoice.extras.findIndex((e: any) =>
            e.label.includes('Member') || e.label === 'Pay-per-use Fee'
          );
          if (idx >= 0) {
            this.membershipExtra = this.invoice.extras[idx];
            this.invoice.extras.splice(idx, 1);
          }
        }
        this.unitPriceWithFee = +(parseFloat(this.invoice.unitPrice) * 1.2).toFixed(2);
        this.baseAmountWithFee = +(parseFloat(this.invoice.baseAmount) * 1.2).toFixed(2);
        this.recalculateTotal();
      });
    }
  }

  addExtra() {
    if (this.newExtra.label && this.newExtra.price > 0) {
      this.invoice.extras.push({ ...this.newExtra });
      this.newExtra = { label: '', price: 0 };
      this.recalculateTotal();
    }
  }

  removeExtra(index: number) {
    const removed = this.invoice.extras.splice(index, 1)[0];
    if (removed) {
      this.recalculateTotal();
    }
  }

  submitInvoice() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    const data = {
      ...this.invoice,
      extras: [
        ...this.invoice.extras,
        ...(this.membershipExtra ? [this.membershipExtra] : [])
      ],
      totalAmount: this.totalAmount,
    };
  
    if (orderId) {
      this.isSending = true;  // ✅ Démarre l'animation
  
      this.invoiceService.submitInvoice(orderId, data).subscribe({
        next: () => {
          alert('Invoice sent!');
          this.router.navigate(['/helper-dashboard']);
        },
        error: (err) => {
          console.error('Failed to send invoice:', err);
          alert('Erreur lors de l’envoi de la facture.');
        },
        complete: () => {
          this.isSending = false;  // ✅ Stop l'animation même si erreur
        }
        });
      }
    }

  private recalculateTotal() {
    const extrasSum = this.invoice.extras.reduce(
      (sum: number, e: any) => sum + parseFloat(e.price),
      0
    );
    const membership = this.membershipExtra ? parseFloat(this.membershipExtra.price) : 0;
    this.totalAmount = +(this.baseAmountWithFee + extrasSum + membership).toFixed(2);
  }
}
