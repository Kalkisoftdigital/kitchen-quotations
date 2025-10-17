import { CdkAccordionModule } from '@angular/cdk/accordion';
import { AsyncPipe, NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ColorPickerModule } from 'ngx-color-picker';
import { ToastrService } from 'ngx-toastr';
import { MaterialModule } from 'src/app/enquiry-management/file-upload/material.module';
import { NativeDateAdapter } from '@angular/material/core';

declare var createGoogleEvent: any;

@Component({
  selector: 'app-meeting-popup',
  templateUrl: './meeting-popup.component.html',
  styleUrls: ['./meeting-popup.component.scss'],
  standalone: true,
  providers: [NativeDateAdapter],
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    ColorPickerModule,
    NgFor,
    HttpClientModule,
    MatIconModule,

    MatDividerModule,
    MatExpansionModule,
    CdkAccordionModule,
    MatMenuModule,
    AsyncPipe,
    MatStepperModule,
    MatBadgeModule,
    MatSlideToggleModule,
    NgbModule,
    FormsModule,
    MaterialModule,
    MatSnackBarModule,
    MatTabsModule
  ]
})
export class MeetingPopupComponent {
  customerForm!: FormGroup;
  modalRef: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<MeetingPopupComponent>
  ) {}

  appointmentForm!: FormGroup;

  ngOnInit() {
    this.appointmentForm = this.fb.group({
      appointmentTime: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      summary: ['', Validators.required],
      location: ['', Validators.required],
      description: ['']
    });
  }


  scheduleMeeting() {
    // Check if the form is valid
    if (this.appointmentForm.valid) {
      let appointmentTime = new Date(this.appointmentForm.value.appointmentTime);
      // Convert the date to the desired format with a custom offset (e.g., -07:00)
      const startTime = appointmentTime.toISOString().slice(0, 18) + '-00:00';
      const endTime = this.getEndTime(appointmentTime);
      const eventDetails = {
        email: this.appointmentForm.value.email,
        startTime: startTime,
        endTime: endTime,
        summary: this.appointmentForm.value.summary,
        location: this.appointmentForm.value.location,
        description: this.appointmentForm.value.description
      };
      
      //this.generateICSFile()
      createGoogleEvent(eventDetails, () => {
        // If the event is successfully created, close the dialog
        this.dialogRef.close();
        this.toastr.success('Event created successfully!');
      });
    } else {
      // If the form is not valid, display an error message or handle it as needed
      this.toastr.error('Form is not valid. Cannot schedule meeting.');
      // You can also optionally mark the form controls as touched to trigger validation messages
      this.appointmentForm.markAllAsTouched();
    }
  }

  
  getEndTime(appointmentTime: Date) {
    // Add one hour to the start time
    const endTime = new Date(appointmentTime.getTime() + (60 * 60 * 1000));
    // Format the end time as required
    const formattedEndTime = endTime.toISOString().slice(0, 18) + '-00:00';
    return formattedEndTime;
}

  generateICSFile() {
    const datetimeValue = this.appointmentForm.value.appointmentTime;
    const date = new Date(datetimeValue);
    const endTime = new Date(date);
    endTime.setHours(endTime.getHours() + 1);
    // Format dates to be in the proper format for the .ics file
    const formattedStartDate = date.toISOString().replace(/-/g, '').replace(/:/g, '').slice(0, -5);
    const formattedEndDate = endTime.toISOString().replace(/-/g, '').replace(/:/g, '').slice(0, -5);
    // Event details
    const eventName = 'Sample Event';
    const eventDescription = 'This is a sample event';
    const location = 'Sample Location';
    // Create the .ics content
    const icsContent = `BEGIN:VCALENDAR
  VERSION:2.0
  BEGIN:VEVENT
  DTSTAMP:${formattedStartDate}Z
  DTSTART:${formattedStartDate}Z
  DTEND:${formattedEndDate}Z
  SUMMARY:${eventName}
  DESCRIPTION:${eventDescription}
  LOCATION:${location}
  END:VEVENT
  END:VCALENDAR`;
    // Create a Blob containing the .ics content
    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8'
    });
    // Create a download link for the Blob
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'event.ics';
    // Trigger the download
    downloadLink.click();
  }

  resetForm(): void {
    this.customerForm.reset();
  }

  goBack() {
    this.router.navigate(['//schedule-meeting/']);
  }
}
