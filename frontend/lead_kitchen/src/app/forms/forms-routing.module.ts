import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { CustomerTableComponent } from './customer-table/customer-table.component';

const routes: Routes = [
  { path: 'customer-form', component: CustomerComponent },
  { path: 'list', component:CustomerTableComponent },
  { path: 'customer-form/:id', component: CustomerComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
