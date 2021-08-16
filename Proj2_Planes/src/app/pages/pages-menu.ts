import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'FEATURES',
    group: true,
  },
  {
    title: 'Maps',
    icon: 'map-outline',
    children: [
      {
        title: 'Bubble Maps',
        link: '/pages/maps/bubble',
      }
    ],
  },
];
