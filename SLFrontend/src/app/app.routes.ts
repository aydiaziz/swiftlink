
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
import { helperAuthGuard } from './helper-auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotificationOnboardingComponent } from './notification-onboarding/notification-onboarding.component';
import { NoticeComponent } from './notice/notice.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { OfficeDashboardComponent } from './office-dashboard/office-dashboard.component';
import { LiveWorkBoardComponent } from './office-dashboard/live-work-board/live-work-board.component';
import { WorkOrdersComponent } from './office-dashboard/work-orders/work-orders.component';
import { WorkSchedulesComponent } from './office-dashboard/work-schedules/work-schedules.component';
import { AccountsComponent } from './office-dashboard/accounts/accounts.component';
import { IntakeComponent } from './office-dashboard/intake/intake.component';
import { WelcomeComponent } from './office-dashboard/welcome/welcome.component';

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
    { path: 'helper-signin', component: SigninhelperComponent },
    { path: 'application', component: SignuphelperComponent },
    { path: 'admin/helper/:id', component: AdminHelperViewComponent,
      canActivate: [authGuard]  },
    { path: 'onborading/:id', component: HelperFormComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'confirmation', component: ConfirmationComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    {path:'confirmationOnboarding',component:NotificationOnboardingComponent},
    {path:'onboardingcompleted',component:NoticeComponent},
 { path: 'helper-dashboard',
  component: HelperDashboardComponent,
  canActivate: [helperAuthGuard],

  children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'agenda', component: AgendaComponent },
      { path: 'my-work', component: DashboardComponent },
      { path: 'work-board', component: OrdersComponent },
      { path: 'invoice/:orderId', component: InvoiceComponent },
      
    ]
  },
  { path: 'office-dashboard',
        component: OfficeDashboardComponent,
        canActivate: [authGuard],
        children: [
          { path: '', component: WelcomeComponent },
          { path: 'live-work-board', component: LiveWorkBoardComponent },
          { path: 'work-orders', component: WorkOrdersComponent },
          { path: 'work-schedules', component:WorkSchedulesComponent  },
          { path: 'accounts', component: AccountsComponent },
          { path: 'intake', component: IntakeComponent },
          
        ]
      },
  
  

    { path: '**', redirectTo: '' },
    
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}