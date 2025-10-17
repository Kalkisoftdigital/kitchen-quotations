import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatesCitiesRoutingModule } from './states-cities-routing.module';
import { StateFormComponent } from './states/state-form/state-form.component';
import { StateListComponent } from './states/state-list/state-list.component';
import { CityListComponent } from './city/city-list/city-list.component';
import { CityFormComponent } from './city/city-form/city-form.component';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { ReactiveFormsModule } from '@angular/forms';


import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  declarations: [
    StateFormComponent,
    StateListComponent,
    CityListComponent,
    CityFormComponent
  ],
  imports: [
    CommonModule,
    StatesCitiesRoutingModule,

    SharedModule,
    NgbDropdownModule,
    ColorPickerModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
    NgFor,
    DataTablesModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonModule,MatCheckboxModule,
    MatStepperModule,MatBadgeModule,MatDialogModule,MatSlideToggleModule
  ]
})
export class StatesCitiesModule { }
