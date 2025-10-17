// Angular Import
import { Component, DoCheck, ViewContainerRef } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { GradientConfig } from 'src/app/app-config';

// bootstrap
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from 'src/app/add-category/add-category.component';
import { LoginService } from 'src/app/services/Login/login.service';
import { ToastrService } from 'ngx-toastr';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { QuotationManagementService } from 'src/app/services/quotation-management-service/quotation-management.service';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';

export interface EnquiryDetail {
  id: number;
  enquiryId: number;
  date: string;
  remark: string;
  status: string;
  loginUserName: string;
  time: string;
}

export interface EnquiryWithDetails {
  id: number;
  business_name: string;
  // Add other fields from enquiry
  details: EnquiryDetail[];
}
export interface Notification {
  title: string;
  date: string;
  details: EnquiryDetail[];
}
@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
    ])
  ]
})
export class NavRightComponent implements DoCheck {
  // public props
  visibleUserList: boolean;
  chatMessage: boolean;
  isFullScreen = false; // Track the fullscreen state
  friendId!: number;
  gradientConfig = GradientConfig;
  userDetails: any;
  eventsByDate: any = {};
  calendarEvents: any[] = [];

  notifications: { yesterday: Notification[]; today: Notification[]; tomorrow: Notification[] } = {
    yesterday: [],
    today: [],
    tomorrow: []
  };

  filteredEvents: any[] = [];

  // constructor
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private loginService: LoginService,
    private customerService: QuotationManagementService,
    private toastr: ToastrService,
    private enquiryService: EnquiryManagementService
  ) {
    this.visibleUserList = false;
    this.chatMessage = false;

    // Add event listener for full screen change
    document.addEventListener('fullscreenchange', this.onFullScreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullScreenChange.bind(this)); // Safari
    document.addEventListener('msfullscreenchange', this.onFullScreenChange.bind(this)); // IE/Edge
  }
  // public method
  onChatToggle(friendID: number) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }

  ngOnInit(): void {
    this.loginService.userDetails$.subscribe((userDetails: any) => {
      this.userDetails = userDetails;
    });
    this.sessionStorageData();

    this.loadAllEnquiriesWithDetails();
  }
  userId: number | null = null;
  userRole: string | null = null;
  // sessionStorageData() {
  //   const sessionStorageData = sessionStorage.getItem('leadManagement');
  //   const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
  //   this.userId = user?.user?.id || null;
  //   this.userRole = user?.user?.role || null;
  // }
  sessionStorageData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.userId = user?.user?.id || null;
    this.userRole = user?.user?.role || null;
  }
  ngDoCheck() {
    if (document.querySelector('body')?.classList.contains('elite-rtl')) {
      this.gradientConfig.isRtlLayout = true;
    } else {
      this.gradientConfig.isRtlLayout = false;
    }
  }
  getInitials(fullname: string): string {
    if (!fullname) return '';
    const initials = fullname
      .split(' ')
      .map((name) => name.charAt(0))
      .slice(0, 2) // Get the first two characters
      .join('');
    return initials.toUpperCase(); // Convert to uppercase if needed
  }

  logout() {
    // Clear session storage
    sessionStorage.removeItem('leadManagement');
    sessionStorage.removeItem('userDetails');
    this.loginService.setUserDetails(null);

    this.userDetails = null;
    // Navigate to login page
    this.closeDropdown();
    this.loginService.logout();
    this.router.navigate(['/signIn']);

    // this.openDialog();
  }
  handleLogout(event: Event) {
    event.preventDefault();
    this.logout();
    this.toastr.success('Log Out successfully!');
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '400px',
      viewContainerRef: this.viewContainerRef, // Append to the body
      disableClose: true // Disable closing on clicking outside
    });

    dialogRef.afterClosed().subscribe((result) => {
      // You can handle the result if needed
    });
  }
  closeDropdown(): void {
    const dropdownMenus = document.querySelectorAll('.dropdown-menu.show'); // Find all open dropdown menus
    dropdownMenus.forEach((menu) => {
      menu.classList.remove('show'); // Close the dropdown menu
    });
  }

  profile(userId: number | null) {
    if (userId) {
      // this.router.navigate(['/users/user-form', userId]);
      this.router.navigate(['/users/user-form', userId], { queryParams: { source: 'table' }, skipLocationChange: true });
    }
  }

  // notification
  // Method to determine if a date is today, yesterday, or tomorrow
  getDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (this.isSameDay(date, today)) {
      return 'Today';
    } else if (this.isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else if (this.isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    } else {
      return 'Other';
    }
  }

  // Helper method to check if two dates are the same day
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  // Load and group enquiries by date
  loadAllEnquiriesWithDetails(page: number = 1, pageSize: number = 10): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const userRole = user.user ? user.user.role : null;
    const loginCompany = user.user ? user.user.select_company : null;

    if (userRole && loginCompany) {
      this.enquiryService
        .getAllEnquiriesList(userId, page, pageSize, userRole, loginCompany)
        .pipe(
          mergeMap((data: any) => {
            const enquiries = data.data as EnquiryWithDetails[];

            const enquiryDetailsObservables = enquiries.map((enquiry: EnquiryWithDetails) =>
              this.enquiryService.getEnquiryDetails(enquiry.id).pipe(
                map((details: any) => ({
                  ...enquiry,
                  details: details.data
                }))
              )
            );

            return forkJoin(enquiryDetailsObservables);
          })
        )
        .subscribe(
          (combinedData: EnquiryWithDetails[]) => {
            const events = combinedData.flatMap((enquiry: EnquiryWithDetails) =>
              enquiry.details
                .filter((detail: EnquiryDetail) => ['Follow Up', 'Meeting'].includes(detail.status))
                .map((detail: EnquiryDetail) => ({
                  title: `${enquiry.business_name} - ${detail.status} by ${detail.loginUserName}`,
                  date: new Date(detail.time)
                }))
            );

            this.calendarEvents = events;
            this.categorizeEventsByDate(events);
          },
          (error) => {
            // this.toastr.error('Error fetching enquiries and details');
          }
        );
    } else {
      // this.toastr.error('Enquiries not found in session.');
    }
  }

  categorizeEventsByDate(events: any[]): void {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

    this.eventsByDate = {
      yesterday: events.filter((e) => e.date >= startOfYesterday && e.date < startOfToday),
      today: events.filter((e) => e.date >= startOfToday && e.date < startOfTomorrow),
      tomorrow: events.filter((e) => e.date >= startOfTomorrow && e.date < new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000))
    };
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    }
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Handle full screen changes
  onFullScreenChange(): void {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
      this.isFullScreen = true;
    } else {
      this.isFullScreen = false;
    }
  }

  // Toggle full screen mode
  toggleFullScreen(): void {
    if (!this.isFullScreen) {
      const elem = document.documentElement as any; // Type assertion
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        // Safari
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        // IE/Edge
        elem.msRequestFullscreen();
      }
      this.isFullScreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        // Safari
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        // IE/Edge
        (document as any).msExitFullscreen();
      }
      this.isFullScreen = false;
    }
  }
}
