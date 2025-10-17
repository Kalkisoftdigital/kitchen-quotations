import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemManagementRoutingModule } from './item-management-routing.module';

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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AddCategoryComponent } from './Category/add-category/add-category.component';
import { CategoryTableComponent } from './Category/category-table/category-table.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatStepperModule } from '@angular/material/stepper';
import { ServiceTableComponent } from './service-table/service-table/service-table.component';
import { ServiceFormComponent } from './service-form/service-form/service-form.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipListPipe } from './service-table/tooltip-list.pipe';
import { MatChipsModule } from '@angular/material/chips';

import { LoaderComponent } from '../shared/loader/loader.component';
import { SharedLoadingModule } from '../shared-loading/shared-loading.module';
@NgModule({
  declarations: [AddCategoryComponent, CategoryTableComponent, ServiceTableComponent, ServiceFormComponent, TooltipListPipe],
  imports: [
    CommonModule,
    SharedLoadingModule,
    ItemManagementRoutingModule,
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
    MatCheckboxModule,
    MatTooltipModule,
    MatStepperModule,
    MatBadgeModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatChipsModule
  ]
})
export class ItemManagementModule {}
