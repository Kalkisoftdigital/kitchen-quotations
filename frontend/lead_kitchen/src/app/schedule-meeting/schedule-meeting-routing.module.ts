import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import path from 'path';
import { GoogleCalanderComponent } from './google-calander/google-calander/google-calander.component';

const routes: Routes = [
{  path:'', component:GoogleCalanderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScheduleMeetingRoutingModule { }
