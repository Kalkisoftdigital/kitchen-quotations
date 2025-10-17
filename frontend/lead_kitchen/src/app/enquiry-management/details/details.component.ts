import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { Enquiry } from 'src/app/models/enquiry.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { format } from 'date-fns';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent {
  quotationPrintUrl: string | null = null;
  productQuotationPrintUrl: string | null = null;
  followUpsCount: number = 0;
  uploadsCount: number = 2;
  notesCount: number = 0;
  mainTableData: any;
  quotations: any[] = [];
  ProductQuotations: any[] = [];
  quotationSent: boolean = false;
  quotationDates: string[] = [];
  productQuotationDates: string[] = [];
  productQuotationSent: boolean = false;
  serviceQuotationIds: string[] = [];
  productQuotationIds: string[] = [];
  quotationDate: string | null = null;
  productQuotationDate: string | null = null;
  quotationPrintUrls: string[] = [];
  productQuotationPrintUrls: string[] = [];
  productQuotationId: string | null = null;
  serviceQuotationId: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private router: Router,
    private enquiryService: EnquiryManagementService,
    private dialogRef: MatDialogRef<DetailsComponent>
  ) {
    this.mainTableData = data.mainTableData;
  }

  ngOnInit() {
    if (this.mainTableData && Array.isArray(this.mainTableData.details)) {
      this.notesCount = this.mainTableData.details.filter((detail: any) => detail.status === 'Note').length;

      this.followUpsCount = this.mainTableData.details.filter((detail: any) => detail.status === 'Follow Up').length;
    }

    this.enquiryService.getAllQuotations(1, 10).subscribe((response) => {
      this.quotations = response.data;

      this.checkQuotationSent();
    });

    this.enquiryService.getAllProductQuotations(1, 10).subscribe((response) => {
      this.ProductQuotations = response.data;

      this.checkQuotationSent();
    });
  }

  formatTime(time: string | Date): string {
    let formattedTime = '';
    if (time) {
      const dateObj = new Date(time);
      formattedTime = format(dateObj, 'dd/MM/yyyy - h:mm a');
    }
    return formattedTime;
  }

  checkQuotationSent() {
    const matchingServiceQuotations = this.quotations.filter((quotation) => quotation.customer_name === this.mainTableData.name);

    if (matchingServiceQuotations.length > 0) {
      this.quotationSent = true;
      this.quotationDates = matchingServiceQuotations.map((quotation) => quotation.quotation_date);
      this.serviceQuotationIds = matchingServiceQuotations.map((quotation) => quotation.quotation_id);
      this.quotationPrintUrls = matchingServiceQuotations.map((quotation) => `/quotation/print/${quotation.quotation_id}`);
    } else {
      this.quotationSent = false;
    }

    const matchingProductQuotations = this.ProductQuotations.filter((quotation) => quotation.customer_name === this.mainTableData.name);

    if (matchingProductQuotations.length > 0) {
      this.productQuotationSent = true;
      this.productQuotationDates = matchingProductQuotations.map((quotation) => quotation.quotation_date);
      this.productQuotationIds = matchingProductQuotations.map((quotation) => quotation.quotation_id);
      this.productQuotationPrintUrls = matchingProductQuotations.map(
        (quotation) => `/quotation/productQuotation-print/${quotation.quotation_id}`
      );
    } else {
      this.productQuotationSent = false;
    }
  }

 

  openQuotationPrint(url: string) {
    const queryParams = { source: 'details' };
    this.router.navigate([url], { queryParams, skipLocationChange: true });
    this.dialogRef.close();
  }
}
