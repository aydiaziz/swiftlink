import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AnnualIncomeComponent } from './annual-income/annual-income.component';
import { MonthyIncomeComponent } from './monthy-income/monthy-income.component';
import { OrdersComponent } from './orders/orders.component';
import { AgendaComponent } from './agenda/agenda.component';
import { HistoricOrdersComponent } from './historic-orders/historic-orders.component';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-helper-dashboard',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf,SidebarComponent,AnnualIncomeComponent,MonthyIncomeComponent,OrdersComponent,AgendaComponent,HistoricOrdersComponent,ProfileComponent],
  templateUrl: './helper-dashboard.component.html',
  styleUrls: ['./helper-dashboard.component.css']
})
export class HelperDashboardComponent implements OnInit {
  currentSection: string = 'profile';

  onSectionChange(section: string) {
    this.currentSection = section;
  }
  orders: any[] = [];
  errorMessage: string = '';
  helperServiceTypes: string[] = [];

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadHelperServiceTypes();
    this.loadOrders();
  }

  // ✅ Charger les `serviceTypes` du helper connecté
  loadHelperServiceTypes(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.role === 'Workforce' && user.workCategory.length > 0) {
          this.helperServiceTypes = user.workCategory.map((category: { name: string }) => category.name);
          this.loadOrders();  // 🔄 Charger les ordres après avoir les services
        } else {
          this.errorMessage = 'No service types found for this helper!';
        }
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.errorMessage = 'Failed to load user data!';
      }
    });
  }

  // ✅ Charger les ordres filtrés par `serviceType`
  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => this.orders = data,
      error: (err) => {
        console.error('Error loading orders:', err);
        this.errorMessage = 'Failed to load orders. Please try again!';
      }
    });
  }
  

  
}
