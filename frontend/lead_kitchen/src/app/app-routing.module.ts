// Angular Import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { AuthGuard } from './auth.guard';
import { SignInComponent } from './sign-in/sign-in.component';

const routes: Routes = [
  {
    path: 'signIn', component: SignInComponent

  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/analytics',
        pathMatch: 'full'
      },
      
      {
        path: 'analytics',
        loadComponent: () => import('./demo/dashboard/dash-analytics/dash-analytics.component')
      },
    
      {
        path: 'customers',
        loadChildren: () => import('./forms/forms.module').then((m) => m.FormsModule),
      },
      {
        path: 'item-management',
        loadChildren: () => import('./item-management/item-management.module').then((m) => m.ItemManagementModule),
      },
      {
        path: 'company',
        loadChildren: () => import('./company-form/company-form.module').then((m) => m.CompanyFormModule),
      },
      {
        path: 'enquiry',
        loadChildren: () => import('./enquiry-management/enquiry-management.module').then((m) => m.EnquiryManagementModule),
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
        // canActivate: [AuthGuard],
      },
      {
        path: 'calendar',
        loadChildren: () => import('./schedule-meeting/schedule-meeting.module').then((m) => m.ScheduleMeetingModule),
      },
      {
        path: 'quotation',
        loadChildren: () => import('./quotation-management/quotation-management.module').then((m) => m.QuotationManagementModule),
      },   
      {
        path: 'EmailSendData',
        loadChildren: () => import('./email-send-data/email-send-data.module').then((m) => m.EmailSendDataModule),
      },
      {
        path: 'registration',
        loadChildren: () => import('./registration/registration.module').then((m) => m.RegistrationModule),
      },
      {
        path: 'kalkisoft',
        loadChildren: () => import('./kalkisoft-mgmt/kalkisoft-mgmt.module').then((m) => m.KalkisoftMgmtModule),
      },
      {
        path: '',
        loadChildren: () => import('./states-cities/states-cities.module').then((m) => m.StatesCitiesModule),
      },
    ]
  },
  { path: '**', redirectTo: '/signIn' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
