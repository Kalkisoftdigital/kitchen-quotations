import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KalkisoftDashboardComponent } from './kalkisoft-dashboard/kalkisoft-dashboard.component';
import { kalkisoft } from '../kalkisoft-role.guard';

const routes: Routes = [
  { path: '', component: KalkisoftDashboardComponent, canActivate: [kalkisoft] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KalkisoftMgmtRoutingModule {}
