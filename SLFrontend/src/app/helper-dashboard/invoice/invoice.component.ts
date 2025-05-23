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
  totalAmount: number = 0;
  isSending: boolean = false;

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
        this.totalAmount = res.totalAmount;
      });
    }
  }

  addExtra() {
    if (this.newExtra.label && this.newExtra.price > 0) {
      this.invoice.extras.push({ ...this.newExtra });
      this.totalAmount += this.newExtra.price;
      this.newExtra = { label: '', price: 0 };
    }
  }

  removeExtra(index: number) {
    const removed = this.invoice.extras.splice(index, 1)[0];
    this.totalAmount -= removed.price;
  }

  submitInvoice() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    const data = {
      ...this.invoice,
      totalAmount: this.totalAmount,
    };
  
    if (orderId) {
      this.isSending = true;  // ✅ Démarre l'animation
  
      this.invoiceService.submitInvoice(orderId, data).subscribe({
        next: (blob) => {
          // ✅ Téléchargement du PDF
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `Invoice_${orderId}.pdf`;
          link.click();
  
          // ✅ Message optionnel
          alert('Invoice sent and downloaded!');
  
          // ✅ Redirection automatique
          this.router.navigate(['/helper-dashboard/dashboard']);
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
}
