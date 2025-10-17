import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MeetingPopupComponent } from '../meeting-popup/meeting-popup.component';

import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EnquiryManagementService } from 'src/app/services/enquiry-management-service/enquiry-management.service';
import { Observable, forkJoin, map } from 'rxjs';
import { format } from 'date-fns';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Enquiry {
  id: number;
  name: string;
  contact_number: number;
  contact_person: string;
  // name: string;
  address: string;
  email: string;
  gst_in: string;
  createdOn: string;
  status_main: string;
  loginUserName: string;
}

@Component({
  selector: 'app-google-calander',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgApexchartsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    FullCalendarModule,
    
    MatTooltipModule
  ],
  templateUrl: './google-calander.component.html',
  styleUrls: ['./google-calander.component.scss']
})
export class GoogleCalanderComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg: DateClickArg) => this.handleDateClick(arg),
    events: [],
    eventContent: (arg) => {
      const { title } = arg.event;
      const [name, statusWithTime, loginUserName] = title.split(' - ');
      const [status, time] = statusWithTime.split(' at ');

      let textColor = 'black';
      if (status === 'Follow Up') {
        textColor = 'green';
      } else if (status === 'Meeting') {
        textColor = 'red';
      }

      let formattedTime = '';
      if (time) {
        const dateObj = new Date(time);
        formattedTime = format(dateObj, 'h:mm a');
      }

      const trimmedBusinessName = name.length > 10 ? name.substring(0, 10) + '...' : name;
      const trimmedloginUserName = loginUserName.length > 5 ? loginUserName.substring(0, 5) + ' ...' : loginUserName;

      return {
        html: `<div matTooltip="${name}"><b>${trimmedBusinessName}</b><br/><div style="color: ${textColor}"> ${status}${formattedTime ? ' at <br>' + formattedTime : ''}</div></div>`
      };
    }
  };

  enquiries: Enquiry[] = [];
  p: number = 1;
  itemsPerPage: number = 25;
  totalItems: number = 0;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private enquiryService: EnquiryManagementService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadEnquiries();
  }

  handleDateClick(arg: DateClickArg) {
    // handle date click event
  }

  loadEnquiries(page: number = 1, pageSize: number = 10): void {
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;
    const userId = user?.user?.id ?? null;
    const userRole = user?.user?.role ?? null;
    const loginCompany = user?.user?.select_company ?? null;

    if (userId) {
      this.enquiryService.getAllEnquiriesList(userId, page, pageSize, userRole, loginCompany).subscribe(
        (enquiriesResponse: any) => {
          this.enquiries = enquiriesResponse.data;
          this.totalItems = enquiriesResponse.total;
          this.p = page;
          this.itemsPerPage = pageSize;
          const newArray: Observable<any>[] = [];

          this.enquiries.forEach((enquiry: any) => {
            newArray.push(
              this.enquiryService.getEnquiryDetails(enquiry.id).pipe(
                map((detailsArray: any) => ({
                  ...enquiry,
                  details: detailsArray.data
                }))
              )
            );
          });

          forkJoin(newArray).subscribe(
            (combinedData: any[]) => {
              const events = combinedData.reduce((acc: any[], enquiry: any) => {
                const relevantDetails = enquiry.details.filter(
                  (detail: any) => detail.status === 'Follow Up' || detail.status === 'Meeting'
                );
                const eventDetails = relevantDetails.map((detail: any) => ({
                  title: `${enquiry.name} - ${detail.status} at ${detail.time} - ${enquiry.loginUserName}`,
                  date: detail.time,
                  details: relevantDetails
                }));
                return [...acc, ...eventDetails];
              }, []);

              const filteredEvents = events.reduce((acc: any[], event: any) => {
                const existingEventIndex = acc.findIndex((e: any) => e.title === event.title);
                if (existingEventIndex !== -1) {
                  acc[existingEventIndex] = event;
                } else {
                  acc.push(event);
                }
                return acc;
              }, []);

              this.calendarOptions.events = filteredEvents;
            },
            (error) => {
              this.toastr.error('Error combining enquiries data');
            }
          );
        },
        (error) => {
          this.toastr.error('Error fetching enquiries');
        }
      );
    }
  }

  onPageChange(event: PageEvent) {
    this.loadEnquiries(event.pageIndex + 1, event.pageSize);
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(MeetingPopupComponent, {
      width: '600px',
      enterAnimationDuration,
      exitAnimationDuration
    });
  }
}
