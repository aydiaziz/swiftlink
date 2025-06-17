import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient,HTTP_INTERCEPTORS  } from '@angular/common/http';  // ✅ Ajout de HttpClientModule
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './app/home/home.component';
import { ServicesComponent } from './app/home/services/services.component';
import { AboutComponent } from './app/home/about/about.component';
import { ContactComponent } from './app/home/contact/contact.component';
import { SignupComponent } from './app/auth/signup/signup.component';
import { NotificationsComponent } from './app/notifications/notifications.component';
import { SigninComponent } from './app/auth/signin/signin.component';
import { HelperDashboardComponent } from './app/helper-dashboard/helper-dashboard.component';
import { SigninhelperComponent } from './app/auth/signinhelper/signinhelper.component';
import { SignuphelperComponent } from './app/auth/signuphelper/signuphelper.component';
import { ProfileComponent } from './app/helper-dashboard/profile/profile.component';
import { AgendaComponent } from './app/helper-dashboard/agenda/agenda.component';
import { DashboardComponent } from './app/helper-dashboard/dashboard/dashboard.component';
import { OrdersComponent } from './app/helper-dashboard/orders/orders.component';
import { withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { ChatComponent } from './app/chat/chat.component';
import { InvoiceComponent } from './app/helper-dashboard/invoice/invoice.component';
import { UserProfileComponent } from './app/user-profile/user-profile.component';
import { HelperProfileComponent } from './app/helper-profile/helper-profile.component';
import { AdminDashboardComponent } from './app/admin-dashboard/admin-dashboard.component';
import { AdminHelperViewComponent } from './app/admin-helper-view/admin-helper-view.component';
import { HelperFormComponent } from './app/helper-form/helper-form.component';
import { ConfirmationComponent } from './app/confirmation/confirmation.component';
import { authGuard } from './app/auth.guard';
import { helperAuthGuard } from './app/helper-auth.guard';
import { UnauthorizedComponent } from './app/unauthorized/unauthorized.component';
import { CsrfInterceptor } from './app/interceptors/csrf.service';
import { NotificationOnboardingComponent } from './app/notification-onboarding/notification-onboarding.component';
import { NoticeComponent } from './app/notice/notice.component';
import { ForgotPasswordComponent } from './app/forgot-password/forgot-password.component';
import { OfficeDashboardComponent } from './app/office-dashboard/office-dashboard.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { LiveWorkBoardComponent } from './app/office-dashboard/live-work-board/live-work-board.component';
import { WorkOrdersComponent } from './app/office-dashboard/work-orders/work-orders.component';
import { WorkSchedulesComponent } from './app/office-dashboard/work-schedules/work-schedules.component';
import { AccountsComponent } from './app/office-dashboard/accounts/accounts.component';
import { IntakeComponent } from './app/office-dashboard/intake/intake.component';
import { WelcomeComponent } from './app/office-dashboard/welcome/welcome.component';
import { SigninclientComponent } from './app/auth/signinclient/signinclient.component';
const routes: Routes = [
  { path: '', component: HomeComponent },  
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signuphelper', component: SignuphelperComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'signin', component: SigninComponent },
  {path:'signin-client',component:SigninclientComponent},
   { path: 'helper-dashboard',
      component: HelperDashboardComponent,
      canActivate: [helperAuthGuard],
      children: [
        { path: '', component: WelcomeComponent },
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
  { path: 'helper-signin', component: SigninhelperComponent },
  { path: 'application', component: SignuphelperComponent },
  { path: 'chat/:id', component: ChatComponent },
  { path: 'userprofile', component: UserProfileComponent },
  {path:'helper-profile/:id',component:HelperProfileComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent },
   {
      path: 'admindashboard',
      component: AdminDashboardComponent,
      canActivate: [authGuard] 
    },
  { path: 'admin/helper/:id', component: AdminHelperViewComponent,
      canActivate: [authGuard]  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'onborading/:id', component: HelperFormComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  {path:'confirmationOnboarding',component:NotificationOnboardingComponent},
  {path:'onboardingcompleted',component:NoticeComponent}
  
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));