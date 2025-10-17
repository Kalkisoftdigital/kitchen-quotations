import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleMeetingRoutingModule } from './schedule-meeting-routing.module';
import { MatButtonModule } from '@angular/material/button';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrModule } from 'ngx-toastr';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [],
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    SharedModule,
    CommonModule,
    ScheduleMeetingRoutingModule,
    MatButtonModule,
    NgbDropdownModule,FullCalendarModule ,
    ToastrModule.forRoot()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ScheduleMeetingModule {}
