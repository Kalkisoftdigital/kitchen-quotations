export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: NavigationItem[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    url: '/analytics',
    icon: 'feather icon-home'
  },
  {
    id: 'basic',
    title: 'Customer ',
    type: 'collapse',
    icon: 'feather icon-users',
    children: [
      {
        id: 'customer',
        title: 'Add Customer',
        type: 'item',
        url: '/customers/customer-form'
      },
      {
        id: 'customer',
        title: 'Customer List',
        type: 'item',
        url: '/customers/list'
      }
    ]
  },
 

  

 

 
  // {
  //   id: 'basic',
  //   title: 'State - City',
  //   type: 'collapse',
  //   icon: 'feather icon-package',
  //   children: [
  //     // {
  //     //   id: 'customer',
  //     //   title: 'State Form',
  //     //   type: 'item',
  //     //   url: '/state-form'
  //     // },
  //     {
  //       id: 'customer',
  //       title: 'State List',
  //       type: 'item',
  //       url: 'state-list'
  //     },
  //     // {
  //     //   id: 'customer',
  //     //   title: 'City Form',
  //     //   type: 'item',
  //     //   url: '/city-form'
  //     // },
  //     {
  //       id: 'customer',
  //       title: 'City List',
  //       type: 'item',
  //       url: 'city-list'
  //     }
  //   ]
  // },

  {
    id: 'dashboard',
    title: 'Calendar',
    type: 'item',
    url: '/calendar/',
    icon: 'feather icon-calendar'
  },

  // {
  //   id: 'basic',
  //   title: 'Company',
  //   type: 'collapse',
  //   icon: 'feather icon-briefcase',
  //   children: [
  //     {
  //       id: 'quotation',
  //       title: 'Company Form',
  //       type: 'item',
  //       url: '/company/company-form'
  //     },
  //     {
  //       id: 'customer',
  //       title: 'Company List',
  //       type: 'item',
  //       url: '/company/company-list'
  //     }
  //   ]
  // },
  // {
  //   id: 'basic',
  //   title: 'Users',
  //   type: 'collapse',
  //   icon: 'feather icon-users',
  //   children: [
  //     {
  //       id: 'quotation',
  //       title: 'User Form',
  //       type: 'item',
  //       url: '/users/user-form'
  //     },
  //     {
  //       id: 'customer',
  //       title: 'User List',
  //       type: 'item',
  //       url: '/users/user-list'
  //     }
  //   ]
  // },
  // {
  //   id: 'basic',
  //   title: 'Registration',
  //   type: 'collapse',
  //   icon: 'feather icon-list',
  //   children: [
  //     {
  //       id: 'RegisterationList',
  //       title: 'Registeration',
  //       type: 'item',
  //       url: '/registration/sign-up'
  //     },
  //     {
  //       id: 'RegisterationList',
  //       title: 'Registeration List',
  //       type: 'item',
  //       url: '/registration/list'
  //     }
  //   ]
  // }
];
