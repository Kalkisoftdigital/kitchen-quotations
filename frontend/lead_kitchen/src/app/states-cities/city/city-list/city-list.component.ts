import { Component, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { MatDialog, MatDialogRef, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { ItemManagementService } from 'src/app/services/item-management-service/item-management.service';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { StatesCitiesService } from 'src/app/services/state-city/state-city.service';
import { CityFormComponent } from '../city-form/city-form.component';

export interface PeriodicElement {
  cityId: string;
  state_name: string;
  city_name: string;
  status: string;
}

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  styleUrls: ['./city-list.component.scss']
})
export class CityListComponent {
  modalRef!: BsModalRef;
  private stateAddedSubscription: Subscription;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private stateService: StatesCitiesService,
    public dialog: MatDialog
  ) {
    this.loadCities();
    // Subscribe to stateAdded$ to refresh the table when a new state is added
    this.stateAddedSubscription = this.stateService.stateAdded$.subscribe(() => {
      this.loadCities();
    });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string, cityId?: number): void {
    const dialogRef = this.dialog.open(CityFormComponent, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { cityId } // Pass the cityId to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  displayedColumns: string[] = ['id', 'state_name', 'city_name', 'status', 'Edit', 'Delete'];

  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(page: number = 1, pageSize: number = 10): void {
    this.stateService.getAllCities(page, pageSize).subscribe(
      (data: any) => {
        this.dataSource.data = data.data; // Assuming your backend sends data in this format
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        this.toastr.error('Error fetching customers');
      }
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from stateAdded$ to avoid memory leaks
    this.stateAddedSubscription.unsubscribe();
  }

  // Function to handle pagination change event
  onPageChange(event: PageEvent): void {
    this.loadCities(event.pageIndex + 1, event.pageSize);
  }

  editCustomer(id: number): void {
    const dialogRef = this.dialog.open(CityFormComponent, {
      width: '400px',
      data: { cityId: id } // Pass the category ID to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  deleteCity(id: number, city_name: string): void {
    if (confirm(`Are you sure you want to delete City ${city_name} ?`)) {
      this.stateService.deleteCity(id).subscribe(
        () => {
          this.toastr.success('category deleted successfully');
          this.loadCities(); // Refresh the customer list after deletion
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

  // openForm() {
  //   this.router.navigate(['/item-management/add-category']);
  // }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
