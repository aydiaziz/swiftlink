export interface InvoiceExtra {
  label: string;
  price: number;
}

export interface Invoice {
  invoiceID: number;
  orderID: number;
  helperID: number;
  serviceType: string;
  duration: number; // hours worked
  unitPrice: number;
  baseAmount: number;
  extras: InvoiceExtra[];
  totalAmount: number;
  status?: string;
  createdAt: string;
  sentToClient: boolean;
}
