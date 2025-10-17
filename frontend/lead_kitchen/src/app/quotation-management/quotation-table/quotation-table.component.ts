import { Component, ElementRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, forkJoin, map } from 'rxjs';
import { QuotationManagementService } from 'src/app/services/quotation-management-service/quotation-management.service';
import { Console } from 'console';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';

export interface PeriodicElement {
  id: number;
  item_quotation:number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  quotations_descriptions: [];
  // business_name: string;
  // agent_commission: string;
  quotation_id: string;
  state: string;
  descriptions: Description[];
}

export interface Description {
  amount: string;
  hsn_code: string;
  itemDescription: string;
  quantity: string;
  quotation_id: number;
  quotationdesc_id: number;
  rate: string;
  select_service: string | null;
}

@Component({
  selector: 'app-quotation-table',
  templateUrl: './quotation-table.component.html',
  styleUrls: ['./quotation-table.component.scss']
})
export class QuotationTableComponent {
  modalRef!: BsModalRef;
  productSelected: boolean = false;
  serviceSelected: boolean = false;
  totalCount: number | null = null;
  isLoading = false;
  userRole: string | null = null;
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  //
  p: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  pagination: PaginationInstance = {
    id: 'custom',
    itemsPerPage: this.itemsPerPage,
    currentPage: this.p,
    totalItems: 0
  };
  config: NgbPaginationConfig = new NgbPaginationConfig();
  showServiceTable: boolean = true;

  showProductTable: boolean = false;
  private quotationAddedSubscription: Subscription | null = null;
  toggleProductTable() {
    this.showProductTable = true;
    this.showServiceTable = false;
    this.scrollToTable();
  }
  toggleServiceTable() {
    this.showServiceTable = true;
    this.showProductTable = false;
    this.scrollToTable();
  }
  private scrollToTable() {
    const tableContainer = this.tableContainer.nativeElement;
    tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  //
  constructor(
    private modalService: BsModalService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private customerService: QuotationManagementService,
    private elementRef: ElementRef
  ) {
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [15, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.loadQuotations();
  }

  displayedColumns: string[] = [
    'quotation_id',
    'item_quotation',
    'created_at',

    'customer_name',
    // 'business_name',
    // 'agent_commission',
    'grand_total',
    'updated_at',
    'Edit','Copy',
    'Delete',
    'View',
    'sendWhatsapp',
    'sendEmail'
  ];

  dataSource = new MatTableDataSource<PeriodicElement>();
  productDataSource = new MatTableDataSource<any>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  currentPage: number = 1;
  pageSize: number = 10;

  ngOnInit(): void {
    this.loadQuotations();
    this.loadProductQuotations();

    // Subscribe to quotationAdded$ to refresh the table when a new category is added
    this.quotationAddedSubscription = this.customerService.quotationAdded$.subscribe(() => {
      this.loadQuotations();
    });

    this.sessionDate();
  }

  sessionDate() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    this.userRole = user?.user?.role || null;
    this.updateDisplayedColumns();
  }

  updateDisplayedColumns() {
    this.displayedColumns = [
      'quotation_id',
      
      'created_at',
      'customer_name',
      // 'business_name',
      // 'agent_commission',
      'grand_total',
      'updated_at',
      'View',
      'sendWhatsapp',
      'sendEmail'
    ];

    if (this.userRole === 'superadmin') {
      // this.displayedColumns.push('Delete');
      this.displayedColumns.push('Edit','Copy','Delete');
    } else {
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const trimmedValue = filterValue.trim().toLowerCase();

    // Filter the main dataSource
    this.dataSource.filter = trimmedValue;

    // If the paginator is available, reset to the first page after filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    // Filter the productDataSource
    this.productDataSource.filter = trimmedValue;

    // If the paginator is available, reset to the first page after filtering
    if (this.productDataSource.paginator) {
      this.productDataSource.paginator.firstPage();
    }
  }
  
  editQuotation(id: number): void {
    this.router.navigate(['/quotation/form', id]);
  }
  copyQuotation(id: number, customer_name: string): void {
    if (confirm(`Are you sure you want to create a copy of ${customer_name}'s quotation?`)) {
    this.router.navigate(['/quotation/form', id], { queryParams: { createCopy: 'true' } });
  }
}
  /** Announce the change in sort grand_total for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  openForm() {
    this.router.navigate(['/quotation/form']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadProductQuotations(page: number = 1, pageSize: number = 10): void {
    this.customerService.getAllProductQuotations(page, pageSize).subscribe(
      (quotationsData: any) => {
        const quotations = quotationsData.data;
        const newArray: Observable<any>[] = [];

        quotations.forEach((quotation: any) => {
          newArray.push(
            this.customerService.getProductQuotationDescriptions(quotation.quotation_id).pipe(
              map((descriptionData: any) => {
                return {
                  ...quotation,
                  descriptions: descriptionData.data
                };
              })
            )
          );
        });

        forkJoin(newArray).subscribe(
          (combinedData: any[]) => {
            this.productDataSource.data = combinedData;
            this.totalItems = combinedData.length; // Set the totalItems to the length of the data array
            this.pagination = { ...this.pagination, totalItems: this.totalItems };
          },
          (error) => {
            // this.toastr.error('Error fetching Quotations');
          }
        );
      },
      (error) => {
        // this.toastr.error('Error fetching Quotations');
      }
    );
  }
  loadQuotations(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const userRole = user.user ? user.user.role : null;
    const loginCompany = user.user ? user.user.select_company : null;
    this.isLoading = true;
    if (userRole && loginCompany) {
      let quotationObservable: Observable<any>;

      if (userRole && loginCompany) {
        quotationObservable = this.customerService.getAllQuotationsAll(userId, this.p, this.itemsPerPage, userRole, loginCompany);
      } else {
        quotationObservable = this.customerService.getAllQuotationsAll(userId, this.p, this.itemsPerPage, userRole, loginCompany);
      }

      quotationObservable.subscribe(
        (quotationsData: any) => {
          const quotations = quotationsData.data;
          if (quotations.length === 0) {
            // Stop the loader if no quotations are found
            this.isLoading = false;
            // this.toastr.info('No quotations found.');
            return;
        }
          const newArray: Observable<any>[] = [];

          quotations.forEach((quotation: any) => {
            newArray.push(
              this.customerService.getQuotationDescriptions(quotation.quotation_id).pipe(
                map((descriptionData: any) => {
                  return {
                    ...quotation,
                    descriptions: descriptionData.data
                  };
                })
              )
            );
          });

          forkJoin(newArray).subscribe(
            (combinedData: any[]) => {
              this.isLoading = false;
              this.dataSource.data = combinedData;
              this.totalCount = quotationsData.total;
              this.pagination = { ...this.pagination, totalItems: this.totalItems };
              this.totalItems = quotationsData.total; // Use the total from the quotationsData
              this.pagination = { ...this.pagination, totalItems: this.totalItems };
            },
            (error) => {
              // this.toastr.error('Error fetching Quotations');
              this.isLoading = false;
            }
          );
        },
        (error) => {
          // this.toastr.error('Error fetching Quotations');
          this.isLoading = false;
        }
      );
    } else {
      // this.toastr.error('Quotations not found in session.');
      this.isLoading = false;
    }
  }



  onPageChange(page: number) {
    this.p = page;
    this.loadQuotations();
  }

  deleteCustomer(id: number, customer_name: string): void {
    if (confirm(`Are you sure you want to delete ${customer_name}'s quotation?`)) {
      this.customerService.deleteQuotation(id).subscribe(
        () => {
          this.toastr.success('Quotation deleted successfully');
          this.loadQuotations(); // Refresh the customer list after deletion
          this.customerService.notifyCategoryAdded();
        },
        (error) => {
          this.toastr.error('Error deleting Quotation');
        }
      );
    }
  }
  deleteProduct(id: number, business_name: string): void {
    if (confirm(`Are you sure you want to delete Business ${business_name}?`)) {
      this.customerService.deleteProductQuotation(id).subscribe(
        () => {
          this.toastr.success('Product Quotation deleted successfully');
          // Remove the deleted item from the data source
          const newData = this.productDataSource.data.filter((item) => item.quotation_id !== id);
          this.productDataSource.data = newData;
          this.pagination.totalItems = newData.length;
          this.loadProductQuotations();
        },
        (error) => {
          this.toastr.error('Error deleting Product Quotation');
        }
      );
    }
  }

  

  viewQuotation(id: number): void {
    this.router.navigate(['/quotation/print', id], { queryParams: { source: 'table' }, skipLocationChange: true });
  }

  sendWhatsapp(contactNumber: string): void {
    const whatsappUrl = `https://wa.me/${contactNumber}`;
    window.open(whatsappUrl, '_blank');
  }

  sendQuotationPdf(id: number): void {
    this.router.navigate(['/quotation/print', id], { skipLocationChange: true });
  }
}
