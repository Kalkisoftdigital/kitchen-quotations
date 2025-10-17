import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StateFormComponent } from './states/state-form/state-form.component';
import { StateListComponent } from './states/state-list/state-list.component';
import { CityFormComponent } from './city/city-form/city-form.component';
import { CityListComponent } from './city/city-list/city-list.component';

const routes: Routes = [
  {path:'state-form', component: StateFormComponent},
  {path:'state-list', component: StateListComponent},

  {path:'city-form', component: CityFormComponent},
  {path:'city-list', component: CityListComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatesCitiesRoutingModule { }
