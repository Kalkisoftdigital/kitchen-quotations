import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddCategoryComponent } from './Category/add-category/add-category.component';
import { CategoryTableComponent } from './Category/category-table/category-table.component';
import { ServiceTableComponent } from './service-table/service-table/service-table.component';
import { ServiceFormComponent } from './service-form/service-form/service-form.component';
import { kalkiSAdminManagerExecutive } from '../kalkisoft-superadmin-manager-executive.guard';

const routes: Routes = [
  { path: 'item-form', component: ServiceFormComponent, canActivate: [kalkiSAdminManagerExecutive] },
  { path: 'item-form/:id', component: ServiceFormComponent, canActivate: [kalkiSAdminManagerExecutive] },

  { path: 'item-list', component: ServiceTableComponent, canActivate: [kalkiSAdminManagerExecutive] },
  { path: 'add-category', component: AddCategoryComponent, canActivate: [kalkiSAdminManagerExecutive] },
  { path: 'category-list', component: CategoryTableComponent, canActivate: [kalkiSAdminManagerExecutive] }

  //kitchen
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemManagementRoutingModule {}
