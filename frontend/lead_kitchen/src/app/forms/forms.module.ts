import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsRoutingModule } from './forms-routing.module';
import { CustomerComponent } from './customer/customer.component';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerTableComponent } from './customer-table/customer-table.component';
import { MatChipsModule } from '@angular/material/chips';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { SharedLoadingModule } from '../shared-loading/shared-loading.module';

@NgModule({
  declarations: [CustomerComponent, CustomerTableComponent],
  imports: [
    CommonModule,
    SharedLoadingModule,
    FormsRoutingModule,
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
    MatChipsModule,
    MatTooltipModule
  ]
})
export class FormsModule {}
