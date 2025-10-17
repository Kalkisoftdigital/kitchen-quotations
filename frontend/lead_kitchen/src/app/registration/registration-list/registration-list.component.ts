import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/services/customer-management-service/customer.service';
import { LoginService } from 'src/app/services/Login/login.service';
import { PageEvent } from '@angular/material/paginator';

export interface PeriodicElement {
  id: number;
  fullname: string;
  username: string;
  email: string;
  status: string;
  created_on: string;
}

@Component({
  selector: 'app-registration-list',
  templateUrl: './registration-list.component.html',
  styleUrls: ['./registration-list.component.scss']
})
export class RegistrationListComponent {
  modalRef!: BsModalRef;

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
  }
  displayedColumns: string[] = ['id', 'fullname', 'email', 'username', 'created_on', 'status', 'Edit', 'Delete'];

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
  openForm() {
    this.router.navigate(['/registration/sign-up']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.fetchCustomers();
  }
  //get
  fetchCustomers(page: number = 1, pageSize: number = 10): void {
    this.customerService.getAllUsers(page, pageSize).subscribe(
      (data: any) => {
        this.dataSource.data = data.data; // Assuming your backend sends data in this format
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        this.toastr.error('Error fetching Users');
      }
    );
  }

  // Function to handle pagination change event
  onPageChange(event: PageEvent): void {
    this.fetchCustomers(event.pageIndex + 1, event.pageSize);
  }

  // delete
  deleteCustomer(id: number, fullname: string): void {
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
    this.router.navigate(['/registration/sign-up', id], { skipLocationChange: true });
  }
}
