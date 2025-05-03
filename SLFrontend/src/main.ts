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
const routes: Routes = [
  { path: '', component: HomeComponent },  
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'signin', component: SigninComponent },
   { path: 'helper-dashboard', 
      component: HelperDashboardComponent,
      children: [
        { path: 'profile', component: ProfileComponent },
        { path: 'agenda', component: AgendaComponent },
        { path: 'dashboard', component: DashboardComponent },
        { path: 'orders', component: OrdersComponent },
        
      ]
    },
  { path: 'signinhelper', component: SigninhelperComponent },
  { path: 'signuphelper', component: SignuphelperComponent },
  { path: 'chat/:id', component: ChatComponent },
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
    }
  ]
}).catch(err => console.error(err));