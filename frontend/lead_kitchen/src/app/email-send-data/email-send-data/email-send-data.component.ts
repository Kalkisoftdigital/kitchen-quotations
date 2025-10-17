import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { EmailSendService } from 'src/app/services/email-send-service/email-send.service';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { PaginationInstance } from 'ngx-pagination';
export interface PeriodicElement {
  id: number;
  created_on: string;
  userName: string;
  quotationId: string;
  businessName: string;
  recipientEmail: string;
}

@Component({
  selector: 'app-email-send-data',
  templateUrl: './email-send-data.component.html',
  styleUrls: ['./email-send-data.component.scss']
})
export class EmailSendDataComponent {
  modalRef!: BsModalRef;
  quotations: any[] = [];
  quotationSent: boolean = false;
  quotationPrintUrls: string[] = [];
  totalCount: number | null = null;
  isLoading = false;

  p: number = 1;
  itemsPerPage: number = 25;
  totalItems: number = 0;
  pagination: PaginationInstance = {
    id: 'custom',
    itemsPerPage: this.itemsPerPage,
    currentPage: this.p,
    totalItems: 0
  };
  config: NgbPaginationConfig = new NgbPaginationConfig();
  constructor(
    private modalService: BsModalService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private enquiryService: EnquiryManagementService,
    private customerService: EmailSendService
  ) {
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }

  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.fetchProducts();
  }

  displayedColumns: string[] = ['id', 'created_on', 'userName', 'quotationId', 'businessName', 'recipientEmail', 'ViewQuote', 'Delete'];

  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  ngOnInit(): void {
    this.fetchProducts();

    this.enquiryService.getAllQuotations(1, 10).subscribe((response) => {
      this.quotations = response.data;

      this.checkQuotationSent();
    });
  }
  checkQuotationSent() {
    const matchingServiceQuotations = this.quotations.filter((quotation) => quotation.customer_name === this.dataSource.data);

    if (matchingServiceQuotations.length > 0) {
      this.quotationSent = true;
      this.quotationPrintUrls = matchingServiceQuotations.map((quotation) => `/quotation/print/${quotation.quotation_id}`);
    } else {
      this.quotationSent = false;
    }
  }

  fetchProducts(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
this.isLoading = true;
    if (user && user.user && user.user.select_company) {
      const companyName = user.user.select_company;

      // Assuming customerService has a method getAllEmailSendDataByUserId in Angular service
      this.customerService.getAllEmailSendDataByUserId(companyName, this.p, this.itemsPerPage).subscribe(
        (data: any) => {
          this.dataSource.data = data.data; // Assuming your backend sends data in this format
          this.totalCount = data.total;
          this.totalItems = data.count;
          this.pagination = { ...this.pagination, totalItems: this.totalItems };
          this.totalItems = data.total;
          this.checkQuotationSent();
          this.isLoading = false;
        },
        (error) => {this.isLoading = false;
          // this.toastr.error('Error fetching customers');
        }
      );
    } else {this.isLoading = false;
      // this.toastr.error('Customer ID not found in session.');
    }
  }

  // Function to handle pagination change event
  onPageChange(page: number) {
    this.p = page;
    this.fetchProducts();
  }

  // delete

  deleteProduct(product_id: number, businessName: string): void {
    if (confirm(`Are you sure you want to delete business '${businessName}' ?`)) {
      this.customerService.deleteEmailSendData(product_id).subscribe(
        () => {
          this.toastr.success('Record deleted successfully');
          this.fetchProducts(); // Refresh the customer list after deletion
        },
        (error) => {
          this.toastr.error('Error deleting Record');
        }
      );
    }
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editCustomer(id: number): void {
    this.router.navigate(['/item-management/product-form', id], { skipLocationChange: true });
  }

  openQuotationPrint(quotationId: number) {
    // Construct the URL based on quotationId
    const url = `/quotation/print/${quotationId}`;
    // Example of navigating to ProductPrintComponent with source parameter
    this.router.navigate(['/quotation/print', quotationId], { queryParams: { source: 'emailSendData' }, skipLocationChange: true });
  }
}
