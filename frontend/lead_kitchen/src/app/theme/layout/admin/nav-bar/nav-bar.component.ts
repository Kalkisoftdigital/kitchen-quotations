// Angular Import
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/Login/login.service';
import { CompanyService } from 'src/app/services/company-service/company.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  // public props
  menuClass = false;
  collapseStyle = 'none';
  windowWidth = window.innerWidth;
  currentDateTime: string | null = null;
  @Output() NavCollapse = new EventEmitter();
  @Output() NavCollapsedMob = new EventEmitter();
   selectedCompanyName: string | null = null;
  selectedLogo: string | null = null; 
  constructor(
    private modalService: BsModalService,
    private router: Router,
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private customerService: CompanyService,
    private LoginServices: LoginService,private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCompanies();
 
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const first_Name = user.user ? user.user.firstName : null;

    

    if (user?.user?.select_company) {
      this.setCompanyDetails(user.user.select_company);
    }

   
    this.updateTime(); // Initial call to set the time
    setInterval(() => this.updateTime(), 60000); // Update every 60 seconds
    this.cdr.detectChanges(); 
  }
  
  updateTime(): void {
    this.currentDateTime = this.getFormattedDateTime();
  }

  getFormattedDateTime(): string {
    const now = new Date();

    // Format date as "10-Oct-2024"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };

    // Get formatted date with hyphens
    const dateParts = now.toLocaleDateString('en-GB', options).split(' ');
    const formattedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;

    // Format time as "[11:39 AM]"
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Return formatted date and time with hyphen
    return `${formattedDate} [${formattedTime}]`;
  }
  //get
  fetchCompanies(page: number = 1, pageSize: number = 10): void {
    this.customerService.getAllCompanies(page, pageSize).subscribe(
      (data: any) => {
       

        data.data.forEach((element:any) => {
         
        });
      },
      (error) => {
      
        this.toastr.error('Error fetching Companies for user');
      }
    );
  }

  
setCompanyDetails(companyName: string): void {
    this.customerService.getAllCompanies().subscribe(
      (data: any) => {
        const company = data.data.find((element: any) => element.companyName === companyName);
        if (company) {
          this.selectedCompanyName = company.companyName;
          if (company.companyLogo) {
            this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/${company.companyLogo.replace('\\', '/')}`;
            if (!this.selectedLogo.includes('uploads/')) {
              this.selectedLogo = `https://kitchen-backend-2.cloudjiffy.net/uploads/${company.companyLogo.replace('\\', '/')}`;
            }
          }
        }
      },
      (error) => {
        
        this.toastr.error('Error fetching company details');
      }
    );
  }
  // public method
  toggleMobOption() {
    this.menuClass = !this.menuClass;
    this.collapseStyle = this.menuClass ? 'block' : 'none';
  }

  navCollapse() {
    if (this.windowWidth >= 992) {
      this.NavCollapse.emit();
    }
  }
}
