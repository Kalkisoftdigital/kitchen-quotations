import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuotationManagementRoutingModule } from './quotation-management-routing.module';
import { QuotationComponent } from './quotation/quotation.component';
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
import { QuotationTableComponent } from './quotation-table/quotation-table.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { QuotationPrintComponent } from './quotation-print/quotation-print.component';
import { AmountInWordsPipe } from './amount-in-words-pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ProductPrintComponent } from './product-print/product-print.component';
import { MatDividerModule } from '@angular/material/divider';
import { LoaderComponent } from '../shared/loader/loader.component';
import { SharedLoadingModule } from '../shared-loading/shared-loading.module';
@NgModule({
  declarations: [
    QuotationComponent,
    QuotationTableComponent,
  
    QuotationPrintComponent,
    AmountInWordsPipe,

    ProductPrintComponent
  ],
  imports: [
    CommonModule,SharedLoadingModule,
    QuotationManagementRoutingModule,
    SharedModule,
    NgbDropdownModule,NgxMatSelectSearchModule,
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
    NgxPaginationModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule, 
    MatChipsModule,
    AsyncPipe, MatSliderModule, MatSlideToggleModule
  ],
  providers: [
    QuotationPrintComponent // Provide QuotationPrintComponent
  ]
})
export class QuotationManagementModule {}
