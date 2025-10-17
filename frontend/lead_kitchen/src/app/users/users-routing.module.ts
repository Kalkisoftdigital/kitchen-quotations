import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersFormComponent } from './users-form/users-form.component';
import { UserTableComponent } from './user-table/user-table.component';
import { superadmin } from '../kalkisoft-superadmin-role.guard';
import { kalkiSuperManager } from '../kalkisoft-superadmin-manager.guard';

const routes: Routes = [
  { path: 'user-form', component: UsersFormComponent, canActivate: [superadmin] },
  { path: 'user-form/:id', component: UsersFormComponent, canActivate: [superadmin] },
  { path: 'user-list', component: UserTableComponent, canActivate: [superadmin] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
