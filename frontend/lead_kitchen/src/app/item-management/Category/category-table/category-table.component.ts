import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { ItemManagementService } from 'src/app/services/item-management-service/item-management.service';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface PeriodicElement {
  id: number;
  created_at: string;
  loginUserName: string;
  sub_category: string;
  description: string;
  status: string;
}
@Component({
  selector: 'app-category-table',
  templateUrl: './category-table.component.html',
  styleUrls: ['./category-table.component.scss']
})
export class CategoryTableComponent {
  modalRef!: BsModalRef;
  private categoryAddedSubscription: Subscription;
  totalCount: number | null = null;
  userRole: string | null = null;
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
    private categoryService: ItemManagementService,
    public dialog: MatDialog
  ) {
    this.loadCategories();
    // Subscribe to categoryAdded$ to refresh the table when a new category is added
    this.categoryAddedSubscription = this.categoryService.categoryAdded$.subscribe(() => {
      this.loadCategories();
    });
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.loadCategories();
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, categoryId?: number): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { categoryId } // Pass the categoryId to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  displayedColumns: string[] = ['id', 'created_at', 'loginUserName', 'sub_category', 'description', 'status', 'Edit', 'Delete'];

  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit(): void {
    this.loadCategories();
    this.sessionData();
    this.updateDisplayedColumns();
  }
  updateDisplayedColumns() {
    this.displayedColumns = ['id', 'created_at', 'loginUserName', 'sub_category', 'description', 'status', 'Edit'];

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

  loadCategories(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const myCompany = user.user ? user.user.select_company : null;
    const loginUserName = user.user ? user.user.fullname : null;

    this.isLoading = true;
    if (myCompany) {
      this.categoryService.getAllCategoriesByCompany(myCompany, this.p, this.itemsPerPage).subscribe(
        (data: any) => {
          this.dataSource.data = data.data; // Assuming your backend sends data in this format

          this.totalItems = data.count;
          this.pagination = { ...this.pagination, totalItems: this.totalItems };
          this.totalItems = data.total;
          this.totalCount = data.total;
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          // this.toastr.error('Error fetching category');
        }
      );
    } else {
      this.isLoading = false;
      // this.toastr.error('customers ID not found in session.');
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from categoryAdded$ to avoid memory leaks
    this.categoryAddedSubscription.unsubscribe();
  }

  // Function to handle pagination change event
  onPageChange(page: number) {
    this.p = page;
    this.loadCategories();
  }

  editCustomer(id: number): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '400px',
      data: { categoryId: id } // Pass the category ID to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  deleteCustomer(id: number, sub_category: string): void {
    if (confirm(`Are you sure you want to delete category ${sub_category} ?`)) {
      this.categoryService.deleteCategory(id).subscribe(
        () => {
          this.toastr.success('category deleted successfully');
          this.loadCategories(); // Refresh the customer list after deletion
        },
        (error) => {
          this.toastr.error('Error deleting category');
        }
      );
    }
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
    this.router.navigate(['/item-management/add-category']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
