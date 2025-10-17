import { Component, ElementRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/services/customer-management-service/customer.service';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { PaginationInstance } from 'ngx-pagination';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

export interface PersonDescription {
  id: number;
  contact_person2: string;
  contact_number2: string;
}

export interface PeriodicElement {
  id: number;
  created_on: number;
  loginUserName: string;
  business_name: string;
  name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  person_descriptions: PersonDescription[];
}

@Component({
  selector: 'app-customer-table',
  templateUrl: './customer-table.component.html',
  styleUrls: ['./customer-table.component.scss']
})
export class CustomerTableComponent {
  modalRef!: BsModalRef;
  selectedFile: File | null = null;
  userId: number = 0;
  myCompany: string | null = null;
  loginUserName: string | null = null;
  loginUserId: number | null = null;
  superAdminId: number | null = null;
  totalCount: number | null = null;
  userRole: string | null = null;
  isLoading = false;
  p: number = 1;
  userData: any;
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
    private customerService: CustomerService
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
  displayedColumns: string[] = ['id', 'created_on', 'loginUserName', 'business_name', 'name', 'contact_person', 'email', 'Edit', 'Delete'];

  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('fileInput') fileInput!: ElementRef;

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
    this.router.navigate(['/customers/customer-form']);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.fetchCustomers();
    this.updateDisplayedColumns();
    this.sessionData();
    // this.sessionDatas();
  }

  //get data pagination sorting
  sessionData() {
    //sessionStorageData data fetch
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    this.loginUserId = user.user ? user.user.id : null;
    this.superAdminId = user.user ? user.user.sessionUser_id : null;
    this.myCompany = user.user ? user.user.select_company : null;
    this.loginUserName = user.user ? user.user.fullname : null;
    this.userRole = user.user ? user.user.role : null;

    this.updateDisplayedColumns();
  }
  // Returns only the first 2 items OF personDescriptions
  getLimitedPersonDescriptions(personDescriptions: any[]): any[] {
    return personDescriptions.slice(0, 2);
  }

  //---------------hide column------------------
  updateDisplayedColumns() {
    this.displayedColumns = ['id', 'created_on', 'loginUserName', 'business_name', 'name', 'contact_person'];

    if (this.userRole === 'superadmin') {
      this.displayedColumns.push('Edit', 'Delete');
    } else {
      this.displayedColumns.push('email'); // Include 'email' for non-superadmin roles
    }
  }
  //-----------hide column-----------------
  fetchCustomers(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const userRole = user.user ? user.user.role : null;
    const loginCompany = user.user ? user.user.select_company : null;
    this.isLoading = true;
    if (userRole && loginCompany) {
      this.customerService.getAllCustomerbyCompany(userId, this.p, this.itemsPerPage, userRole, loginCompany).subscribe(
        (data: any) => {
          this.dataSource.data = data.data; // Assuming your backend sends data in this format
          this.totalItems = data.total; // Update totalItems for pagination
          this.totalCount = data.total;
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;

          // this.toastr.error('Error fetching customers');
        }
      );
    } else {
      this.isLoading = false;
      // this.toastr.error('User role or login company not found in session.');
    }
  }

  onPageChange(page: number) {
    this.p = page;
    this.fetchCustomers();
  }

  //exportToExcel
  exportToExcel(): void {
    // Create a deep copy of the data
    const dataWithCustomHeaders = JSON.parse(JSON.stringify(this.dataSource.filteredData));
    const datePipe = new DatePipe('en-US');

    // Modify the headers, remove any unwanted properties, and add S. No.
    const headers = [
      'S. No.',
      'Created On',
      'Customer Name',
      'Customer Mobile No.',
      'Business Name',
      'Email',
      'Address',
      'City',
      'Reference Person',
      'Reference Contact Number',
      'GSTIN',
      'Landline No',
      'Pincode',
      'State'
    ];
    const dataForExport = dataWithCustomHeaders.map((item: any, index: number) => ({
      'S. No.': index + 1,
      'Created On': datePipe.transform(item['created_on'], 'dd/MM/yyyy'),
      'Customer Name': item['name'],
      'Customer Mobile No.': item['owner_mobile'],
      'Business Name': item['business_name'],
      Email: item['email'],
      Address: item['address'] || '',
      City: item['city'] || '',
      'Reference Person': item['contact_person'] || '',
      'Reference Contact Number': item['contact_number'],
      GSTIN: item['gst_in'] || '',
      'Landline No': item['landline_no'] || '',
      Pincode: item['pincode'] || '',
      State: item['state'] || ''
    }));

    // Convert the modified data to a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExport, { header: headers });

    // Create a new workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    // Trigger the download of the Excel file
    XLSX.writeFile(wb, 'customers.xlsx');
  }

  //importExcel
  importExcel() {
    if (confirm('Are you sure you want to upload Excel sheet data?')) {
      if (!this.selectedFile) {
        this.toastr.error('Please select an Excel file.');
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // Process the imported data
        const processedData = excelData.map((row) => ({
          name: row['Customer Name'] || '', // Ensure the header matches your expectations
          owner_mobile: row['Customer Mobile No.'] || '',
          email: row['Email'] || '',
          contact_number: row['Reference Contact Number'] || '',
          business_name: row['Business Name'] || '',
          contact_person: row['Reference Person'] || '',
          state: row['State'] || '',
          city: row['City'] || '',
          address: row['Address'] || '',
          pincode: row['Pincode'] || '',
          gst_in: row['GSTIN'] || '',
          landline_no: row['Landline No'] || ''
        }));

        const formData = new FormData();
        // Attach the processed data to the formData
        formData.append('data', JSON.stringify(processedData));

        // Add other required fields
        if (this.selectedFile) {
          formData.append('excelFile', this.selectedFile, this.selectedFile.name);
        }

        if (this.loginUserId !== null) {
          formData.append('login_id', this.loginUserId.toString());
        }
        if (this.superAdminId !== null) {
          formData.append('superadmin_id', this.superAdminId.toString());
        }
        if (this.myCompany) {
          formData.append('login_company', this.myCompany);
        }
        if (this.loginUserName) {
          formData.append('loginUserName', this.loginUserName);
        }
        if (this.userRole) {
          formData.append('role', this.userRole);
        }

        this.customerService.importExcelFile(formData).subscribe(
          () => {
            this.toastr.success('File uploaded and data inserted successfully');
            this.fetchCustomers(); // Refresh the customer list after import
          },
          (error) => {
            this.toastr.error('Error uploading Excel file. Please try again later.');
          }
        );
      };
      fileReader.readAsArrayBuffer(this.selectedFile);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.importExcel(); // Directly call importExcel if a file is selected
    }
  }
  // delete
  deleteCustomer(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete customer ${name} ?`)) {
      this.customerService.deleteCustomer(id).subscribe(
        () => {
          this.toastr.success('Customer deleted successfully');
          this.fetchCustomers(); // Refresh the customer list after deletion
        },
        (error) => {
          this.toastr.error('Error deleting customer');
        }
      );
    }
  }

  editCustomer(id: number): void {
    this.router.navigate(['/customers/customer-form', id], { skipLocationChange: true });
  }
}
