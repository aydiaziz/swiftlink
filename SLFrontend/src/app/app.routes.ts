
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ServicesComponent } from './home/services/services.component';
import { AboutComponent } from './home/about/about.component';
import { ContactComponent } from './home/contact/contact.component';
import { SignupComponent } from './auth/signup/signup.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { HelperDashboardComponent } from './helper-dashboard/helper-dashboard.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'signup', component:SignupComponent},
    { path: 'services', component: ServicesComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'notifications', component: NotificationsComponent },
    { path: 'helper-dashboard', component: HelperDashboardComponent },
    { path: '**', redirectTo: '' },
    
  ];
  
  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}