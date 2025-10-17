import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { CompanyService } from 'src/app/services/company-service/company.service';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface PeriodicElement {
  id: number;
  end_date: string;
  companyName: string;
  phoneNo: string;
  state: string;
  users_allowed: string;
  contactNumber: string;
}

@Component({
  selector: 'app-kalkisoft-dashboard',
  templateUrl: './kalkisoft-dashboard.component.html',
  styleUrls: ['./kalkisoft-dashboard.component.scss']
})
export class KalkisoftDashboardComponent {
  calendarEvents: any[] = [];
  filteredEvents: any[] = [];
  totalCompanies: number = 0;
  totalServiceCount: number = 0;
  totalProductionCount: number = 0;
  activeCompanies: number = 0;
  totalUsersAllowed: number = 0;
  nearExpiry: number = 0;
  displayedColumns: string[] = ['id', 'end_date', 'companyName', 'phoneNo', 'state', 'users_allowed'];
  dataSource = new MatTableDataSource<PeriodicElement>();
  totalItems = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  p: number = 1;
  itemsPerPage: number = 25;

  pagination: PaginationInstance = {
    id: 'custom',
    itemsPerPage: this.itemsPerPage,
    currentPage: this.p,
    totalItems: 0
  };
  config: NgbPaginationConfig = new NgbPaginationConfig();

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private router: Router,
    private companyService: CompanyService
  ) {
    this.config.maxSize = 5;
    this.config.boundaryLinks = true;
  }
  itemsPerPageOptions: number[] = [25, 50, 75, 100];
  selectedItemsPerPage: number = this.itemsPerPageOptions[0];
  onItemsPerPageChange(): void {
    this.itemsPerPage = this.selectedItemsPerPage;
    this.p = 1; // Reset to the first page when changing items per page
    this.fetchCompaniesEndingSoon();
  }

  ngOnInit(): void {
    this.fetchCompaniesEndingSoon();
    this.fetchCompanies();
  }
  cards = [
    {
      background: 'bg-c-blue',
      title: 'Total Companies',
      icon: 'assets/images/company.png',
      text: 'Completed Leads',
      number: this.totalCompanies,
      no: '351'
    },
    {
      background: 'bg-c-green',
      title: 'Active Companies',
      icon: 'assets/images/companyactive.png',
      text: 'This Month',
      number: this.activeCompanies,
      no: '120'
    },
    {
      background: 'bg-c-purple',
      title: 'Total Users Allowed',
      icon: 'assets/images/userallowed.png',
      text: 'This Month',
      number: this.totalUsersAllowed,
      no: '110'
    },
    {
      background: 'bg-c-yellow',
      title: 'Nearest Expiring',
      icon: 'assets/images/expiry.png',
      text: 'This Month',
      number: this.nearExpiry,
      no: '105'
    }
  ];

  fetchCompanies(page: number = 1, pageSize: number = 10): void {
    this.companyService.getAllCompanies(page, pageSize).subscribe(
      (data: any) => {
        

        const activeCompaniesCount = data.data.filter((company: any) => company.status === 'active').length;
        // Extract all users_allowed values
        const usersAllowedValues = data.data.map((company: any) => company.users_allowed);
        

        // Calculate the total of all users_allowed values
        const totalUsersAllowed = usersAllowedValues.reduce((sum: number, current: number) => sum + current, 0);
        

        // Assigning to a component property if needed
        this.totalCompanies = data.data.length;

        // Assigning to a component property if needed
        this.totalUsersAllowed = totalUsersAllowed;
        this.activeCompanies = activeCompaniesCount;
        
        this.cards[0].number = this.totalCompanies;
        this.cards[1].number = this.activeCompanies;
        this.cards[2].number = this.totalUsersAllowed;
      },
      (error) => {
        this.toastr.error('Error fetching Companies for user');
      }
    );
  }

  fetchCompaniesEndingSoon(): void {
    this.companyService.getCompaniesEndingSoon(this.p, this.itemsPerPage).subscribe(
      (response: any) => {
        
        this.dataSource.data = response.data;
        this.nearExpiry = response.data.length;
      
        this.cards[3].number = this.nearExpiry;

        this.totalItems = response.totalItems;
        this.pagination = { ...this.pagination, totalItems: this.totalItems };
      },
      (error) => {
        
        this.toastr.error('Error fetching companies ending soon. Please try again later.');
      }
    );
  }

  onPageChange(page: number) {
    this.p = page;
    this.fetchCompaniesEndingSoon();
  }

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

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
