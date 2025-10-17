import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/Login/login.service';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface PeriodicElement {
  // id: number;
  created_id: string;
  select_company: string;
  firstName: string;
  lastName: string;

  email: string;
  // phoneNo: string;
  designation: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent {
  modalRef!: BsModalRef;
  sessionUserId: number | null = null;
  sessionUserName: string | null = null;
  sessionUserRole: string | null = null;
  userRole: string | null = null;
  selectCompany: string | null = null;
  usersAllowed: number = 0;
  companyArray: any[] = [];
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
    private customerService: LoginService
  ) {
    this.customerService.customerAdded$.subscribe(() => {
      this.fetchCustomers(); // Refresh the table data when a new customer is added
    });
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.fetchCustomers();
  }

  displayedColumns: string[] = ['created_id', 'select_company', 'fullName', 'email', 'designation', 'role', 'status', 'action'];

  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  getIcon(role: string): { name: string; color: string } {
    switch (role.toLowerCase()) {
      case 'admin':
        return { name: 'portrait', color: 'accent' };
      case 'superadmin':
        return { name: 'admin_panel_settings', color: 'accent' };
      case 'accountant':
        return { name: 'work_outline', color: 'primary' };
      case 'associate':
        return { name: 'people_outline', color: 'basic' };
      case 'manager':
        return { name: 'person_outline', color: 'warn' };
      default:
        return { name: 'person', color: 'primary' };
    }
  }

  editUser(user: PeriodicElement) {
    // Implement logic to handle edit action
  }
  ngOnInit(): void {
    this.fetchCustomers();
    this.sessionData();
    this.fetchCompanies();
  }

  sessionData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    this.sessionUserId = user?.user?.id ?? null;
    this.sessionUserName = user?.user?.fullname ?? null;
    this.sessionUserRole = user?.user?.role ?? null;
    this.selectCompany = user?.user?.select_company ?? null;
    this.usersAllowed = this.getUsersAllowedForCompany(this.selectCompany);
  }

  //find companyName from companyArray == selectCompany
  getUsersAllowedForCompany(companyName: string | null): number {
    const company = this.companyArray.find((company) => company.companyName === companyName);
    return company ? company.users_allowed : 0;
  }

  //company for show hide add user button
  fetchCompanies(page: number = 1, pageSize: number = 10): void {
    this.isLoading = true;
    this.customerService.getAllCompanies(page, pageSize).subscribe(
      (data: any) => {
        this.companyArray = data.data;
        this.usersAllowed = this.getUsersAllowedForCompany(this.selectCompany);
        this.isLoading = false;
      },
      (error) => {
        this.toastr.error('Error fetching Companies for user');
        this.isLoading = false;
      }
    );
  }

  

  fetchCustomers(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
  
    const userId = user?.user?.id ?? null;
    const userRole = user?.user?.role ?? null;

    if (userId) {
      this.customerService.getAllUserss(userId, this.p, this.itemsPerPage).subscribe(
        (response: any) => {
          
          let data = response.data;

          // Filter the data based on the role
          if (userRole !== 'superadmin' && userRole !== 'kalkisoft') {
            data = data.filter((user: PeriodicElement) => user.role !== 'superadmin');
          }

          this.dataSource.data = data; // Assuming your backend sends data in this format

          this.totalItems = response.count;
          this.pagination = { ...this.pagination, totalItems: this.totalItems };
          this.totalItems = response.total;
        },
        (error) => {
          this.toastr.error('Error fetching customers');
        }
      );
    } else {
      this.toastr.error('customers ID not found in session.');
    }
  }

  canAddUser(): boolean {
    if (this.sessionUserRole === 'kalkisoft') {
      return true; //no restriction to hide button
    }
    if (!this.selectCompany) {
      return false;
    }
    const company = this.companyArray.find((company) => company.companyName === this.selectCompany);

    if (!company) {
      return false;
    }
    //'Add User' button will be shown only if the current number of users for the selected company is less than the allowed number of users (users_allowed).
    return company.users_allowed >= this.dataSource.data.length;
  }

  // Function to handle pagination change event
  onPageChange(page: number) {
    this.p = page;
    this.fetchCustomers();
  }

  // delete
  deleteUser(id: number, fullname: string): void {
    if (confirm(`Are you sure you want to delete User ${fullname} ?`)) {
      this.customerService.deleteUser(id).subscribe(
        () => {
          this.toastr.success('User deleted successfully');
          this.fetchCustomers(); // Refresh the customer list after deletion
        },
        (error) => {
          this.toastr.error('Error deleting User');
        }
      );
    }
  }

  editCustomer(id: number): void {
    this.router.navigate(['/users/user-form', id], { skipLocationChange: true });
  }

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
  openForm() {
    this.router.navigate(['/users/user-form']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
