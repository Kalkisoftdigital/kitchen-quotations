import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnquiryManagementComponent } from './enquiry-management/enquiry-management.component';
import { EnquiryManagementTableComponent } from './enquiry-management-table/enquiry-management-table.component';
import { StatusMasterListComponent } from './status-master/status-master-list/status-master-list.component';
import { StatusMasterComponent } from './status-master/status-master/status-master.component';
import { QuotationPrintComponent } from '../quotation-management/quotation-print/quotation-print.component';
import { ProductPrintComponent } from '../quotation-management/product-print/product-print.component';
import { kalkiSAdminManagerExecutive } from '../kalkisoft-superadmin-manager-executive.guard';
import { superadmin } from '../kalkisoft-superadmin-role.guard';

const routes: Routes = [
  { path: 'form', component: EnquiryManagementComponent, canActivate: [kalkiSAdminManagerExecutive] },
  { path: 'form/:id', component: EnquiryManagementComponent, canActivate: [kalkiSAdminManagerExecutive] },
  { path: 'list', component: EnquiryManagementTableComponent, canActivate: [kalkiSAdminManagerExecutive] },

  { path: 'status-form', component: StatusMasterComponent, canActivate: [kalkiSAdminManagerExecutive] },
  { path: 'status-list', component: StatusMasterListComponent, canActivate: [superadmin] },
  { path: 'status-form/:id', component: StatusMasterComponent, canActivate: [superadmin] },
  { path: 'quotation-print/:id', component: ProductPrintComponent },
  { path: 'productQuotation-print/:id', component: ProductPrintComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnquiryManagementRoutingModule {}
