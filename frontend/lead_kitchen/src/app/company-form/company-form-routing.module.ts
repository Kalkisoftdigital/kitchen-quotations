import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyFormComponent } from './company-form/company-form.component';
import { CompanyFormTableComponent } from './company-form-table/company-form-table.component';
import { kalkisoft } from '../kalkisoft-role.guard';
import { superadmin } from '../kalkisoft-superadmin-role.guard';

const routes: Routes = [
  { path: 'company-form', component: CompanyFormComponent, canActivate: [kalkisoft] },
  { path: 'company-form/:id', component: CompanyFormComponent, canActivate: [superadmin] },
  { path: 'company-list', component: CompanyFormTableComponent , canActivate: [superadmin]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyFormRoutingModule {}
