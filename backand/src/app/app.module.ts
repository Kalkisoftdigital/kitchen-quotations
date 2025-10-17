// Angular Import
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


// project import
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// import { SharedModule } from './theme/shared/shared.module';

import { HttpClientModule } from '@angular/common/http';
// import { ModalModule } from 'ngx-bootstrap/modal';

// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
   
  ],
  imports: [
    BrowserModule,
    
    HttpClientModule,
    AppRoutingModule,
    // SharedModule,
   
  
    // ModalModule.forRoot(),
    // ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
