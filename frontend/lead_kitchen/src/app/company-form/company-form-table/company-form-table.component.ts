import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/services/company-service/company.service';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface PeriodicElement {
  id: number;
  start_date: string;
  end_date: string;
  companyName: string;
  phoneNo: string;
  state: string;
  // users_allowed: string;
  status: string;
}

@Component({
  selector: 'app-company-form-table',
  templateUrl: './company-form-table.component.html',
  styleUrls: ['./company-form-table.component.scss']
})
export class CompanyFormTableComponent {
  modalRef!: BsModalRef;
  userRole: string | null = null;
  selectCompany: string | null = null;

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
    private customerService: CompanyService
  ) {
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.fetchCompanies();
  }
  displayedColumns: string[] = [
    'id',
    'start_date',
    'end_date',
    'companyName',
    'phoneNo',
    'state',
    // 'users_allowed',
    'status',
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
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  ngOnInit(): void {
    this.fetchCompanies();
    this.getUserData();
  }

  getUserData(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.userRole = user?.user?.role || null;
    this.selectCompany = user?.user?.select_company || null;
    this.updateDisplayedColumns()
  }

  updateDisplayedColumns() {
    this.displayedColumns = [ 
      'id',
      'start_date',
      'end_date',
      'companyName',
      'phoneNo',
      'state',
      // 'users_allowed',
      'status',
      'Edit',];

    if (this.userRole === 'kalkisoft') {
      this.displayedColumns.push('Delete');
    } else {

    }
  }
  //get
  fetchCompanies(page: number = 1, pageSize: number = 10): void {
    this.customerService.getAllCompanies(page, pageSize).subscribe(
      (data: any) => {
        
        if (this.userRole === 'superadmin' && this.selectCompany) {
          this.dataSource.data = data.data.filter((company: any) => company.companyName === this.selectCompany);
        } else if (this.userRole === 'kalkisoft') {
          this.dataSource.data = data.data;
        } else {
          this.dataSource.data = [];
        }

        // Set pagination properties
        this.totalItems = data.total;
        this.pagination = { ...this.pagination, totalItems: this.totalItems };

        // Assign sort and paginator to data source
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        // this.toastr.error('Error fetching Companies for user');
      }
    );
  }

  // Function to handle pagination change event
  onPageChange(page: number) {
    this.p = page;
    this.fetchCompanies();
  }

  isEndDateNear(endDate: string): boolean {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  }

  deleteCustomer(id: number, companyName: string): void {
    if (confirm(`Are you sure you want to delete Company ${companyName} ?`)) {
      this.customerService.deleteCompany(id).subscribe(
        () => {
          this.toastr.success('Company deleted successfully');
          this.fetchCompanies(); // Refresh the customer list after deletion
        },
        (error) => {
          this.toastr.error('Error deleting Company');
        }
      );
    }
  }

  editCustomer(id: number): void {
    this.router.navigate(['/company/company-form', id], { skipLocationChange: true });
  }

  openForm() {
    this.router.navigate(['/company/company-form']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
