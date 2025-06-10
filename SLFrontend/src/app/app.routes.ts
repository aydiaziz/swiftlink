
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ServicesComponent } from './home/services/services.component';
import { AboutComponent } from './home/about/about.component';
import { ContactComponent } from './home/contact/contact.component';
import { SignupComponent } from './auth/signup/signup.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { HelperDashboardComponent } from './helper-dashboard/helper-dashboard.component';
import { SigninhelperComponent } from './auth/signinhelper/signinhelper.component';
import { SignuphelperComponent } from './auth/signuphelper/signuphelper.component';
import { ProfileComponent } from './helper-dashboard/profile/profile.component';
import { AgendaComponent } from './helper-dashboard/agenda/agenda.component';
import { DashboardComponent } from './helper-dashboard/dashboard/dashboard.component';
import { OrdersComponent } from './helper-dashboard/orders/orders.component';
import { InvoiceComponent } from './helper-dashboard/invoice/invoice.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminHelperViewComponent } from './admin-helper-view/admin-helper-view.component';
import { HelperFormComponent } from './helper-form/helper-form.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { authGuard } from './auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'signup', component:SignupComponent},
    { path: 'services', component: ServicesComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'notifications', component: NotificationsComponent },
    {
    path: 'admindashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard] 
  },
    { path: 'signinhelper', component: SigninhelperComponent },
    { path: 'application', component: SignuphelperComponent },
    { path: 'admin/helper/:id', component: AdminHelperViewComponent },
    { path: 'onborading/:id', component: HelperFormComponent },
    { path: 'confirmation', component: ConfirmationComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
   { path: 'helper-dashboard', 
    component: HelperDashboardComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'agenda', component: AgendaComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'invoice/:orderId', component: InvoiceComponent },
      
    ]
  },
  
  

    { path: '**', redirectTo: '' },
    
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}