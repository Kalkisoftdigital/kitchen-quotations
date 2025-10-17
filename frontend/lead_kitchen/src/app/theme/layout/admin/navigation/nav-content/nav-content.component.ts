import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationItem, NavigationItems } from '../navigation';
import { Location, LocationStrategy } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nav-content',
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  // version
  title = 'Lead Management';
  currentApplicationVersion = environment.appVersion;

  // public pops
  navigations: NavigationItem[];
  wrapperWidth!: number;
  windowWidth: number;

  @Output() NavMobCollapse = new EventEmitter();
  // constructor
  constructor(
    private location: Location,
    private locationStrategy: LocationStrategy
  ) {
    this.windowWidth = window.innerWidth;
    this.navigations = NavigationItems.slice(); // Make a copy of the original array
  }

  // life cycle event
  ngOnInit() {
    if (this.windowWidth < 992) {
      document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
    }

    // Fetch user role from sessionStorage
    const sessionStorageData = sessionStorage.getItem('leadManagement');
    const user = sessionStorageData ? JSON.parse(sessionStorageData) : null;

    // Conditionally modify navigation based on user role
    if (user.user && user.user.role === 'kalkisoft') {
      this.navigations = NavigationItems.filter((item) => item.url !== '/analytics');
      // Insert additional items for SuperAdmin at index 5
      const superAdminItems: NavigationItem[] = [
        {
          id: 'basic',
          title: 'Kalkosoft',
          type: 'collapse',
          icon: 'feather icon-home',
          children: [
            {
              id: 'Dahboard',
              title: 'dahboard',
              type: 'item',
              url: '/kalkisoft'
            }
          ]
        },
        {
          id: 'basic',
          title: 'Company',
          type: 'collapse',
          icon: 'feather icon-briefcase',
          children: [
            {
              id: 'quotation',
              title: 'Company Form',
              type: 'item',
              url: '/company/company-form'
            },
            {
              id: 'customer',
              title: 'Company Details',
              type: 'item',
              url: '/company/company-list'
            }
          ]
        },

        {
          id: 'basic',
          title: 'Users',
          type: 'collapse',
          icon: 'feather icon-users',
          children: [
            {
              id: 'quotation',
              title: 'Add User',
              type: 'item',
              url: '/users/user-form'
            },
            {
              id: 'customer',
              title: 'User List',
              type: 'item',
              url: '/users/user-list'
            }
          ]
        }
        // Add more items as needed
      ];
      this.navigations = superAdminItems;
    } else {
      // For other roles or when user is not defined, show default NavigationItems
      this.navigations = NavigationItems.slice(); // Make a copy of the original array
    }

    if (user.user && user.user.role === 'superadmin') {
      // Insert additional items for Admin at index 3
      const adminItems: NavigationItem[] = [
        {
          id: 'basic',
          title: 'Lead ',
          type: 'collapse',
          icon: 'feather icon-info',
          children: [
            {
              id: 'customer',
              title: 'Add Lead',
              type: 'item',
              url: '/enquiry/form'
            },
            {
              id: 'customer',
              title: 'All Leads',
              type: 'item',
              url: '/enquiry/list'
            },
            // {
            //   id: 'customer',
            //   title: 'Status Form',
            //   type: 'item',
            //   url: '/enquiry/status-form'
            // },
            {
              id: 'customer',
              title: 'Status Master',
              type: 'item',
              url: '/enquiry/status-list'
            }
          ]
        },
        {
          id: 'basic',
          title: 'Quotation ',
          type: 'collapse',
          icon: 'feather icon-bookmark',
          children: [
            {
              id: 'quotation',
              title: 'Add Quotation',
              type: 'item',
              url: '/quotation/form'
            },
            {
              id: 'customer',
              title: 'Quotation List',
              type: 'item',
              url: '/quotation/list'
            },
            // {
            //   id: 'customer',
            //   title: 'Quotation Form (product)',
            //   type: 'item',
            //   url: '/quotation/product-form'
            // }
           
          ]
        },
        {
          id: 'quotation',
          title: 'Quotation Send',
          type: 'item',
          url: '/EmailSendData/',
          icon: 'feather icon-inbox'
        },
        {
          id: 'basic',
          title: 'Company',
          type: 'collapse',
          icon: 'feather icon-briefcase',
          children: [
            {
              id: 'customer',
              title: 'Company Details',
              type: 'item',
              url: '/company/company-list'
            }
          ]
        },
        {
          id: 'basic',
          title: 'Users',
          type: 'collapse',
          icon: 'feather icon-users',
          children: [
            {
              id: 'customer',
              title: 'User List',
              type: 'item',
              url: '/users/user-list'
            }
          ]
        },
        {
          id: 'basic',
          title: 'Item ',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            // {
            //   id: 'customer',
            //   title: 'Product Form',
            //   type: 'item',
            //   url: '/item-management/product-form'
            // },
            // {
            //   id: 'customer',
            //   title: 'Product List',
            //   type: 'item',
            //   url: '/item-management/product-list'
            // },
            {
              id: 'customer',
              title: 'Add Item',
              type: 'item',
              url: '/item-management/item-form'
            },
            {
              id: 'customer',
              title: 'Item List',
              type: 'item',
              url: '/item-management/item-list'
            },
            {
              id: 'customer',
              title: 'Category Master',
              type: 'item',
              url: '/item-management/category-list'
            },
            
          ]
        }
        // Add more items as needed
      ];
      this.navigations.splice(2, 0, ...adminItems);
    }

    //  ------------------
    if (user.user && user.user.role === 'manager') {
      // Insert additional items for Admin at index 3
      const adminItems: NavigationItem[] = [
        {
          id: 'basic',
          title: 'Lead ',
          type: 'collapse',
          icon: 'feather icon-info',
          children: [
            {
              id: 'customer',
              title: 'Add Lead',
              type: 'item',
              url: '/enquiry/form'
            },
            {
              id: 'customer',
              title: 'All Leads',
              type: 'item',
              url: '/enquiry/list'
            },
            // {
            //   id: 'customer',
            //   title: 'Status Form',
            //   type: 'item',
            //   url: '/enquiry/status-form'
            // },
            // {
            //   id: 'customer',
            //   title: 'Status Master',
            //   type: 'item',
            //   url: '/enquiry/status-list'
            // }
          ]
        },
        {
          id: 'basic',
          title: 'Quotation ',
          type: 'collapse',
          icon: 'feather icon-bookmark',
          children: [
            {
              id: 'quotation',
              title: 'Add Quotation',
              type: 'item',
              url: '/quotation/form'
            },
            {
              id: 'customer',
              title: 'Quotation List',
              type: 'item',
              url: '/quotation/list'
            },
            // {
            //   id: 'customer',
            //   title: 'Quotation Form (product)',
            //   type: 'item',
            //   url: '/quotation/product-form'
            // }
           
          ]
        },
        {
          id: 'basic',
          title: 'Item ',
          type: 'collapse',
          icon: 'feather icon-list',
          children: [
            {
              id: 'customer',
              title: 'Add Item',
              type: 'item',
              url: '/item-management/item-form'
            },
            {
              id: 'customer',
              title: 'Item List',
              type: 'item',
              url: '/item-management/item-list'
            },
            {
              id: 'customer',
              title: 'Category Master',
              type: 'item',
              url: '/item-management/category-list'
            }
          ]
        }

        // Add more items as needed
      ];
      this.navigations.splice(2, 0, ...adminItems);
    }

    // ------------------

    if (user.user && user.user.role === 'executive') {
      // Insert additional items for Admin at index 3
      const adminItems: NavigationItem[] = [
        {
          id: 'basic',
          title: 'Lead ',
          type: 'collapse',
          icon: 'feather icon-info',
          children: [
            {
              id: 'customer',
              title: 'Add Lead',
              type: 'item',
              url: '/enquiry/form'
            },
            {
              id: 'customer',
              title: 'All Leads',
              type: 'item',
              url: '/enquiry/list'
            },
            // {
            //   id: 'customer',
            //   title: 'Status Form',
            //   type: 'item',
            //   url: '/enquiry/status-form'
            // },
            // {
            //   id: 'customer',
            //   title: 'Status Master',
            //   type: 'item',
            //   url: '/enquiry/status-list'
            // }
          ]
        },

        {
          id: 'basic',
          title: 'Quotation ',
          type: 'collapse',
          icon: 'feather icon-bookmark',
          children: [
            {
              id: 'quotation',
              title: 'Add Quotation',
              type: 'item',
              url: '/quotation/form'
            },
            {
              id: 'customer',
              title: 'Quotation List',
              type: 'item',
              url: '/quotation/list'
            },
            // {
            //   id: 'customer',
            //   title: 'Quotation Form (product)',
            //   type: 'item',
            //   url: '/quotation/product-form'
            // }
           
          ]
        },
      ];
      this.navigations.splice(2, 0, ...adminItems);
    }
  }

  // public method

  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      this.NavMobCollapse.emit();
    }
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}
