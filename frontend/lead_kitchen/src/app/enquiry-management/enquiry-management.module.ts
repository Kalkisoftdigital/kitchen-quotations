import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquiryManagementRoutingModule } from './enquiry-management-routing.module';
import { EnquiryManagementComponent } from './enquiry-management/enquiry-management.component';
import { EnquiryManagementTableComponent } from './enquiry-management-table/enquiry-management-table.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatDividerModule } from '@angular/material/divider';
import { StatusMasterComponent } from './status-master/status-master/status-master.component';
import { StatusMasterListComponent } from './status-master/status-master-list/status-master-list.component';
import { AsyncPipe } from '@angular/common';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MaterialModule } from './file-upload/material.module';
import { DetailsComponent } from './details/details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { LoaderComponent } from '../shared/loader/loader.component';
import { SharedLoadingModule } from '../shared-loading/shared-loading.module';

@NgModule({
  declarations: [
    EnquiryManagementComponent,
    EnquiryManagementTableComponent,
    StatusMasterComponent,
    StatusMasterListComponent,
    FileUploadComponent,
    DetailsComponent,
   
  ],
  imports: [SharedLoadingModule,
    CommonModule,
    EnquiryManagementRoutingModule,
    SharedModule,
    NgbDropdownModule,
    ColorPickerModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
    NgxMatTimepickerModule,
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
    MatMenuModule,
    AsyncPipe,
    MatStepperModule,
    MatBadgeModule,
    MatDialogModule,
    MatSlideToggleModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  exports: [FileUploadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EnquiryManagementModule {}
