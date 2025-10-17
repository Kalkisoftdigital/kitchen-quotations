import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { StatusMasterComponent } from '../status-master/status-master.component';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { Subscription } from 'rxjs';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
export interface PeriodicElement {
  id: number;

  status_name: string;
  status: string;
}
@Component({
  selector: 'app-status-master-list',
  templateUrl: './status-master-list.component.html',
  styleUrls: ['./status-master-list.component.scss']
})
export class StatusMasterListComponent {
  private stateAddedSubscription: Subscription | null = null;
  modalRef!: BsModalRef;
  sessionUserId: number | null = null;
  sessionUserName: string | null = null;
  sessionUserRole: string | null = null;
  userRole: string | null = null;
  selectCompany: string | null = null;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'status_name', 'status', 'Edit', 'Delete'];
  dataSource = new MatTableDataSource<PeriodicElement>();

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
    public dialog: MatDialog,
    private enquiryService: EnquiryManagementService
  ) {
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.fetchEnquiryMaster();
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, userId?: number): void {
    const dialogRef = this.dialog.open(StatusMasterComponent, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { userId } // Pass the userId to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  ngOnInit(): void {
    this.sessionData();
    this.fetchEnquiryMaster();
    this.stateAddedSubscription = this.enquiryService.stateAdded$.subscribe(() => {
      this.fetchEnquiryMaster();
    });
  }

  sessionData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.sessionUserId = user?.user?.id ?? null;
  
    this.sessionUserName = user?.user?.fullname ?? null;
    this.sessionUserRole = user?.user?.role ?? null;
    this.selectCompany = user?.user?.select_company ?? null;
  }

  fetchEnquiryMaster(): void {
    if (this.sessionUserId) {
      this.enquiryService.getAllEnquiriesMasterByUserId(this.sessionUserId, this.p, this.itemsPerPage).subscribe(
        (data: any) => {
          
          this.dataSource.data = data.data; // Assuming your backend sends data in this format
          this.totalItems = data.count;
          this.pagination = { ...this.pagination, totalItems: this.totalItems };
          this.totalItems = data.total;
        },
        (error) => {
          this.toastr.error('Error fetching enquiry master');
        }
      );
    } else {
      this.toastr.error('User ID not found in session.');
    }
  }

  onPageChange(page: number) {
    this.p = page;
    this.fetchEnquiryMaster();
  }
  // delete
  deleteUser(id: number, status_name: string): void {
    if (confirm(`Are you sure you want to delete Status ${status_name} ?`)) {
      this.enquiryService.deleteEnquiriesMaster(id).subscribe(
        () => {
          this.toastr.success('Enquiry Master deleted successfully');
          this.fetchEnquiryMaster(); // Refresh the customer list after deletion
        },
        (error) => {
          this.toastr.error('Error deleting Enquiry Master');
        }
      );
    }
  }
  ngOnDestroy(): void {
    // Unsubscribe from stateAdded$ to avoid memory leaks
    this.stateAddedSubscription?.unsubscribe();
  }
  editCustomer(id: number): void {
    const dialogRef = this.dialog.open(StatusMasterComponent, {
      width: '400px',
      data: { userId: id } // Pass the category ID to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {});
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
    this.router.navigate(['/enquiry/status-form']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
