import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuotationComponent } from './quotation/quotation.component';
import { QuotationTableComponent } from './quotation-table/quotation-table.component';


import { QuotationPrintComponent } from './quotation-print/quotation-print.component';

import { ProductPrintComponent } from './product-print/product-print.component';

const routes: Routes = [
  { path: 'product-print/:id', component: ProductPrintComponent },
  { path: 'form', component: QuotationComponent },
  { path: 'form/:id', component: QuotationComponent },

  { path: 'list', component: QuotationTableComponent },
  // { path: 'product-form', component: QuotationProductTableComponent },
  // { path: 'product-form/:id', component: QuotationProductTableComponent },
  // { path: 'print', component: QuotationPrintComponent },
  // { path: 'print/:id', component: QuotationPrintComponent },
  // { path: 'quotation/print/:id', component: QuotationPrintComponent },
  
  
  { path: 'productQuotation-print', component: ProductPrintComponent },
  { path: 'print', component: ProductPrintComponent },
  { path: 'print/:id', component: ProductPrintComponent },
  { path: 'quotation/print/:id', component: ProductPrintComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationManagementRoutingModule {}
