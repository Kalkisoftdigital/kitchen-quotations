// angular import
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProductSaleComponent } from './product-sale/product-sale.component';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexLegend,
  ApexFill,
  ApexGrid,
  ApexPlotOptions,
  ApexTooltip,
  ApexMarkers,
  ApexResponsive
} from 'ng-apexcharts';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChartDB } from 'src/app/fack-db/chartData';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { Observable, forkJoin, map, mergeMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuotationManagementService } from 'src/app/services/quotation-management-service/quotation-management.service';
import { CustomerService } from 'src/app/services/customer-management-service/customer.service';
import { EmailSendService } from 'src/app/services/email-send-service/email-send.service';
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
export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  labels: string[];
  colors: string[];
  responsive?: ApexResponsive[];
  legend: ApexLegend;
  fill: ApexFill;
  grid: ApexGrid;
  markers: ApexMarkers;
};
export type ChartOptionsNew = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-dash-analytics',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgApexchartsModule,
    ProductSaleComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './dash-analytics.component.html',
  styleUrls: ['./dash-analytics.component.scss']
})
export default class DashAnalyticsComponent {
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: Partial<ChartOptions>;
  bar1CAC: Partial<ChartOptions>;
  calendarEvents: any[] = [];
  filteredEvents: any[] = [];
  totalEnquiriesCount: number = 0;
  totalServiceCount: number = 0;
  totalProductionCount: number = 0;
  totalQuotationCount: number = 0;
  totalQuotationSend: number = 0;
  totalOrderConfirmed: number = 0;
  totalOrdercompleted: number = 0;
  eventsByDate: any = {};
  yesterdayCount: number = 0;
  todayCount: number = 0;
  tomorrowCount: number = 0;
  calendarEventsCount: number = 0;
  userId: number | null = null;
  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthCounts: number[] = Array.from({ length: 12 }, () => 0); // Initialize array for 12 months
  leadsConvertedData: number[] = []; // Example array for Leads Converted data
  totalLeadsData: number[] = [];

  totalConfirmedEnquiries: number = 0;

  monthCountsEnquiries: number[] = Array.from({ length: 12 }, () => 0); // Initialize array for 12 months
  // **note - Confirmed Leads is based on updatedOn date
  monthCountsConfirmed: number[] = Array.from({ length: 12 }, () => 0);

  p: number = 1;
  userData: any;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  isLoading = false;
  totalCustomerCount: number = 0;
  totalEmailsSend: number = 0;
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private toastr: ToastrService,
    private router: Router,
    private enquiryService: EnquiryManagementService,
    private customerService: QuotationManagementService,
    private customerServices: CustomerService,
    private emailService: EmailSendService
  ) {
    const chartHeight = 350;

    this.chartDB = ChartDB;
    const { bar1CAC } = this.chartDB;
    const leadsConvertedData = [20, 30, 40, 50, 60, 70, 80, 10, 30, 80, 50, 70];
    const totalLeadsData = [50, 60, 70, 80, 90, 100, 110, 20, 50, 100, 60, 100];

    // Update the tooltip to include the ₹ symbol
    const updatedTooltip = {
      ...bar1CAC.tooltip,
      y: {
        formatter: function (value: any) {
          return value;
        }
      }
    };

    this.bar1CAC = {
      ...bar1CAC,
      chart: {
        ...bar1CAC.chart,
        height: chartHeight
      },
      colors: ['#FFA500', '#1E90FF'],
      xaxis: {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      tooltip: updatedTooltip, // Apply the updated tooltip
      yaxis: {
        title: {
          text: 'Count (in numbers)'
        },
        labels: {
          formatter: function (value) {
            return Math.round(value).toString(); // Round and convert to string
          }
        }
      },
      series: [
        {
          name: 'Total Enquiries',
          data: this.monthCountsEnquiries
        },
        {
          name: 'Confirmed Enquiries', // **note - Confirmed Leads is based on updatedOn date
          data: this.monthCountsConfirmed
        }
      ]
    };
  }

  chartDB: any;
  lastDate!: number;
  data: any;
  intervalSub: string | number | NodeJS.Timer | undefined;
  intervalMain: string | number | NodeJS.Timer | undefined;

  @ViewChild('chart1') charts!: ChartComponent;

  ngOnInit() {
    this.sessionStorageData();
    this.fetchCustomers();
    this.fetchEmailSend();
    this.loadAllEnquiriesWithDetails();
  }

  sessionStorageData() {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.userId = user?.user?.id || null;

    if (this.userId) {
      this.loadEnquiries();
      this.loadQuotations();
    } else {
      this.toastr.error('User ID not found in session.');
    }
  }

  cards = [
    {
      background: 'bg-c-blue',
      title: 'Customers',
      icon: 'assets/images/customers.png',
      text: 'Completed Leads',
      number: this.totalCustomerCount,
      no: '351',
      route: '/customers/list'
    },
    {
      background: 'bg-c-green',
      title: 'Leads',
      icon: 'assets/images/leadgeneration.png',
      text: 'This Month',
      number: this.totalEnquiriesCount,
      no: '120',
      route: '/enquiry/list'
    },
    {
      background: 'bg-c-purple',
      title: 'Quotations',
      icon: 'assets/images/approved.png',
      text: 'This Month',
      number: this.totalServiceCount,
      no: '110',
      route: '/quotation/list'
    },
    {
      background: 'bg-c-yellow',
      title: 'Calendar',
      icon: 'assets/images/calendar.png',
      text: 'This Month',
      number: this.calendarEventsCount,
      no: '105',
      route: '/calendar'
    }
  ];

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

    // Store counts
    this.yesterdayCount = this.eventsByDate.yesterday.length;
    this.todayCount = this.eventsByDate.today.length;
    this.tomorrowCount = this.eventsByDate.tomorrow.length;

    this.calendarEventsCount = this.yesterdayCount + this.todayCount + this.tomorrowCount;

    this.cards[3].number = this.calendarEventsCount;
  }

  fetchCustomers(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const userRole = user.user ? user.user.role : null;
    const loginCompany = user.user ? user.user.select_company : null;
    this.isLoading = false;
    if (userRole && loginCompany) {
      this.customerServices.getAllCustomerbyCompany(userId, this.p, this.itemsPerPage, userRole, loginCompany).subscribe(
        (data: any) => {
          this.totalCustomerCount = data.total;
          this.cards[0].number = this.totalCustomerCount;
          this.isLoading = false;
        },
        (error) => {
          this.toastr.error('Error fetching customers');
          this.isLoading = false;
        }
      );
    } else {
      this.toastr.error('User role or login company not found in session.');
      this.isLoading = false;
    }
  }

  fetchEmailSend(): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    this.isLoading = false;
    if (user && user.user && user.user.select_company) {
      const companyName = user.user.select_company;

      // Assuming customerService has a method getAllEmailSendDataByUserId in Angular service
      this.emailService.getAllEmailSendDataByUserId(companyName, this.p, this.itemsPerPage).subscribe(
        (data: any) => {
          this.totalEmailsSend = data.total;

          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          // this.toastr.error('Error fetching customers');
        }
      );
    } else {
      this.isLoading = false;
      // this.toastr.error('Customer ID not found in session.');
    }
  }

  loadEnquiries(page: number = 1, pageSize: number = 10): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user.user ? user.user.id : null;
    const userRole = user.user ? user.user.role : null;
    const loginCompany = user.user ? user.user.select_company : null;

    if (userRole && loginCompany) {
      this.enquiryService.getAllEnquiriesList(userId, page, pageSize, userRole, loginCompany).subscribe(
        (enquiriesResponse: any) => {
          const enquiries = enquiriesResponse.data;
          this.totalEnquiriesCount = enquiriesResponse.total;
          // this.cards[0].number = this.totalEnquiriesCount;

          this.totalQuotationSend = enquiries.filter((enquiry: any) => enquiry.quotationMailSend === 'yes').length;
          this.cards[1].number = this.totalEnquiriesCount;

          this.totalOrderConfirmed = enquiries.reduce((count: number, enquiry: any) => {
            return enquiry.status_main === 'Confirmed' ? count + 1 : count;
          }, 0);
          // this.cards[2].number = this.totalOrderConfirmed;

          this.totalOrdercompleted = enquiries.reduce((count: number, enquiry: any) => {
            return enquiry.status_main === 'Completed' ? count + 1 : count;
          }, 0);
          // this.cards[3].number = this.totalOrdercompleted;

          const newArray: Observable<any>[] = [];
          enquiries.forEach((enquiry: any) => {
            newArray.push(
              this.enquiryService.getenquiryDashboard(enquiry.id, userId, userRole, loginCompany).pipe(
                map((detailsArray: any) => {
                  return {
                    ...enquiry,
                    details: detailsArray.data
                  };
                })
              )
            );
          });

          this.monthCountsEnquiries.fill(0);
          this.monthCountsConfirmed.fill(0); // **note - Confirmed Leads is based on updatedOn date
          enquiries.forEach((enquiry: any) => {
            const createdMonth = new Date(enquiry.createdOn).getMonth();
            this.monthCountsEnquiries[createdMonth]++;

            if (enquiry.status_main === 'Confirmed') {
              const updatedMonth = new Date(enquiry.updatedOn).getMonth();
              this.monthCountsConfirmed[updatedMonth]++;
            }
          });
          this.updateChartData();

          forkJoin(newArray).subscribe(
            (combinedData: any[]) => {
              const events = combinedData.flatMap((enquiry: any) =>
                enquiry.details
                  .filter((detail: any) => ['Follow Up', 'Meeting'].includes(detail.status))
                  .map((detail: any) => ({
                    title: `${enquiry.business_name} - ${detail.status} by ${detail.loginUserName} at ${detail.time}`,
                    date: detail.time,
                    details: enquiry.details
                  }))
              );

              this.calendarEvents = Array.from(new Set(events.map((e) => e.title))).map(
                (title) => events.find((event) => event.title === title)!
              );

              this.filterTodayEvents();
            },
            (error) => {
              this.toastr.error('Error combining enquiries data');
            }
          );
        },
        (error) => {
          // this.toastr.error('Error fetching enquiries');
        }
      );
    } else {
      // this.toastr.error('enquiries not found in session.');
    }
  }

  updateChartData() {
    // Update chart series data
    this.bar1CAC.series = [
      {
        name: 'Total Leads',
        data: this.monthCountsEnquiries
      },
      {
        name: 'Confirmed Leads', // **note - Confirmed Leads is based on updatedOn date
        data: this.monthCountsConfirmed
      }
    ];
  }
  loadQuotations(page: number = 1, pageSize: number = 10): void {
    if (this.userId) {
      this.customerService.getAllQuotationsByUserId(this.userId, page, pageSize).subscribe(
        (quotationsData: any) => {
          
          this.totalServiceCount = quotationsData.total;
          this.cards[2].number = this.totalServiceCount;
          // this.updateTotalQuotationCount();
        },
        (error) => {}
      );

      this.customerService.getAllProductQuotationsUserId(this.userId, page, pageSize).subscribe(
        (quotationsData: any) => {
          this.totalProductionCount = quotationsData.data.length;

          // this.updateTotalQuotationCount();
        },
        (error) => {}
      );
    } else {
    }
  }
  // updateTotalQuotationCount(): void {
  //   // Update the total quotation count and the card's number property
  //   this.totalQuotationCount = this.totalServiceCount + this.totalProductionCount;
  //   this.cards[1].number = this.totalQuotationCount;
  // }
  filterTodayEvents(): void {
    const today = new Date().toISOString().split('T')[0];
    this.filteredEvents = this.calendarEvents.filter((event) => this.getDateOnly(event.date) === today);
  }
  filterPreviousDayEvents(): void {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    this.filteredEvents = this.calendarEvents.filter((event) => this.getDateOnly(event.date) === yesterday);
  }

  filterNextDayEvents(): void {
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    this.filteredEvents = this.calendarEvents.filter((event) => this.getDateOnly(event.date) === tomorrow);
  }

  getDateOnly(dateTime: string): string {
    return dateTime.split('T')[0];
  }

  formatEventTitle(event: any): string {
    // Extract the date and time from the event title
    const dateTimeStr = event.title.split(' - ')[1];
    const dateTime = new Date(dateTimeStr);

    // Format the date
    const formattedDate = dateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    // Format the time
    const formattedTime = dateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    // Combine formatted date and time
    const formattedDateTime = `${formattedDate} AT ${formattedTime}`;

    // Construct the new event title
    return `${event.title.split(' - ')[0]} - ${formattedDateTime}`;
  }
  formatEventTime(event: any): string {
    const date = new Date(event.date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Extracting the relevant part of the title
    const titleWithoutTime = event.title.split(' at ')[0];

    return `${titleWithoutTime} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  isMeeting(event: any): boolean {
    // Logic to determine if the event is a meeting
    return event.title.includes('Meeting');
  }

  isFollowUp(event: any): boolean {
    // Logic to determine if the event is a follow-up
    return event.title.includes('Follow Up');
  }

  getDayWiseTimeSeries(baseval: number, count: number, yrange: { min: number; max: number }) {
    let i = 0;
    while (i < count) {
      const x = baseval;
      const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      this.data.push({ x, y });
      this.lastDate = baseval;
      baseval += 86400000;
      i++;
    }
  }
}
