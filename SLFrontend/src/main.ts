import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';  // ✅ Ajout de HttpClientModule
import { AppComponent } from './app/app.component';

import { HomeComponent } from './app/home/home.component';
import { ServicesComponent } from './app/home/services/services.component';
import { AboutComponent } from './app/home/about/about.component';
import { ContactComponent } from './app/home/contact/contact.component';
import { SignupComponent } from './app/auth/signup/signup.component';
import { NotificationsComponent } from './app/notifications/notifications.component';
import { SigninComponent } from './app/auth/signin/signin.component';
import { HelperDashboardComponent } from './app/helper-dashboard/helper-dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },  
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'helper-dashboard', component: HelperDashboardComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()  
  ],
}).catch(err => console.error(err));
