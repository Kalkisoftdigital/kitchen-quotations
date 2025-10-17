import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KalkisoftMgmtRoutingModule } from './kalkisoft-mgmt-routing.module';
import { KalkisoftDashboardComponent } from './kalkisoft-dashboard/kalkisoft-dashboard.component';

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
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatDividerModule } from '@angular/material/divider';

import { AsyncPipe } from '@angular/common';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { MatBadgeModule } from '@angular/material/badge';

import { NgApexchartsModule } from 'ng-apexcharts';



@NgModule({
  declarations: [
    KalkisoftDashboardComponent
  ],
  imports: [
    CommonModule,
    KalkisoftMgmtRoutingModule,

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
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    CdkAccordionModule,
    AsyncPipe,
    MatStepperModule,
    MatBadgeModule, 

   
    NgApexchartsModule,

 
    NgApexchartsModule,
   
  ]
})
export class KalkisoftMgmtModule { }
