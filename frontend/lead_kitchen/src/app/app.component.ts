// Angular Import
import { Component, ComponentFactoryResolver, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { AddCategoryComponent } from './add-category/add-category.component';
import { LoginService } from './services/Login/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // constructor
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,private loginService: LoginService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  // life cycle event
  ngOnInit() {
    // this.router.events.subscribe((evt) => {
    //   if (!(evt instanceof NavigationEnd)) {
    //     return;
    //   }
    //   window.scrollTo(0, 0);
    // });
    // // Open the pop-up dialog when the component initializes
   
    // this.loginService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
    //   if (!isLoggedIn) {
    //     // Open login popup
    //     this.openDialog();
    //   }
    // });
  }

  // openDialog(): void {
  //   const dialogRef = this.dialog.open(AddCategoryComponent, {
  //     width: '400px', // Set the width and other configurations as needed
  //     viewContainerRef: this.viewContainerRef, // Append to the body
  //     disableClose: true, // Disable closing on clicking outside
  //     // Add any other configuration options for your dialog
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     
  //     // You can handle the result if needed
  //   });
  // }
}
