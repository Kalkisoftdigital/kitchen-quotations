import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ServicesService } from 'src/app/services/service&product-service/services/services.service';
import { Observable, forkJoin } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface PeriodicElement {
  service_id: number;
  companyLogo: string;
  // loginUserName: string;
  service_name: string;
  select_sub_category: string;
  service_description: string;
  selling_price: string;
  created_at: string;
}

@Component({
  selector: 'app-service-table',
  templateUrl: './service-table.component.html',
  styleUrls: ['./service-table.component.scss']
})
export class ServiceTableComponent {
  modalRef!: BsModalRef;
  totalCount: number | null = null;
  userRole: string | null = null;
  p: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  isLoading = false;

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
    private customerService: ServicesService,
    private sanitizer: DomSanitizer
  ) {
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [10, 25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.fetchServices();
  }
  displayedColumns: string[] = [
    'service_id',
    'companyLogo',
    // 'service_name',
    'created_at',
    // 'loginUserName',
    'select_sub_category',
    'service_description',
    'selling_price',
    'Edit',
    'Delete'
  ];

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
  openForm() {
    this.router.navigate(['/item-management/item-form']);
  }

  ngOnInit(): void {
    this.fetchServices();
    this.sessionData();
    this.updateDisplayedColumns();
  }
  updateDisplayedColumns() {
    this.displayedColumns = [
      'service_id',
      'companyLogo',
      // 'service_name',
      'created_at',
      // 'loginUserName',
      'select_sub_category',
      'service_description',
      'selling_price',
      'Edit'
    ];

    if (this.userRole === 'superadmin') {
      this.displayedColumns.push('Delete');
    } else {
    }
  }
  //get
  sessionData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    this.userRole = user?.user?.role || null;
  }

  //get
  fetchServices(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const myCompany = user.user ? user.user.select_company : null;
    this.isLoading = true;
    if (myCompany) {
      this.customerService.getAllServicesByCompany(myCompany, this.p, this.itemsPerPage).subscribe(
        (servicesData: any) => {
          const services = servicesData.data;
          const observables: Observable<any>[] = [];

          services.forEach((service: any) => {
            observables.push(this.customerService.getAllServiceDescriptions(service.service_id));
          });

          forkJoin(observables).subscribe(
            (descriptionsData: any[]) => {
              const combinedData = services.map((service: any, index: number) => {
                const descriptions = descriptionsData[index].data.map((desc: any) => desc.service_description);
                const logoUrl = service.companyLogo ? `https://kitchen-backend-2.cloudjiffy.net/uploads/${service.companyLogo.replace('\\', '/')}` : null;

return {
    ...service,
    service_description: descriptions.join(', '),
    companyLogo: logoUrl,
display_price: (
  service.selling_price?.trim() !== ''
    ? service.selling_price
    : (service.priceB?.trim() !== '' ? service.priceB : '0.00')
)
  };
              });

              this.dataSource.data = combinedData;
              this.totalItems = servicesData.total; // Set total items from the services API response
              this.pagination = { ...this.pagination, totalItems: this.totalItems };
              this.totalCount = servicesData.total;

              this.isLoading = false;
            },
            (error) => {
              // this.toastr.error('Error fetching Service Descriptions');
              this.isLoading = false;
            }
          );
        },
        (error) => {
          // this.toastr.error('Error fetching Services');
          this.isLoading = false;
        }
      );
    } else {
      // this.toastr.error('Company information not found in session.');
      this.isLoading = false;
    }
  }

  // Function to handle pagination change event
  onPageChange(page: number) {
    this.p = page;
    this.fetchServices();
  }

  editCustomer(id: number): void {
    this.router.navigate(['/item-management/item-form', id], { skipLocationChange: true });
  }

  deleteServices(service_id: number, service_name: string): void {
    if (confirm(`Are you sure you want to delete Service ${service_name} ?`)) {
      this.customerService.deleteService(service_id).subscribe(
        () => {
          this.toastr.success('Item deleted successfully');
          this.fetchServices();
        },
        (error) => {
          this.toastr.error('Error deleting Service');
        }
      );
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDescriptionsTooltipAsString(service_description: string): string {
    const descriptions = service_description.split(',').map((desc) => desc.trim());
    let tooltipContent = '<ol>';
    descriptions.forEach((description) => {
      tooltipContent += `<li>${description}</li>`;
    });
    tooltipContent += '</ol>';
    return tooltipContent;
  }
}
