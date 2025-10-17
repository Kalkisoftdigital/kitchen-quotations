import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailSendDataComponent } from './email-send-data/email-send-data.component';
import { superadmin } from '../kalkisoft-superadmin-role.guard';
import { ProductPrintComponent } from '../quotation-management/product-print/product-print.component';

const routes: Routes = [
  { path: '', component: EmailSendDataComponent, canActivate: [superadmin] },
  { path: 'quotation/print/:id', component: ProductPrintComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailSendDataRoutingModule {}
