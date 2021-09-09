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
        title: 'Planes Dockerized',
        link: '/pages/maps/planes-dockerized',
      },
      {
        title: 'Planes Simulated',
        link: '/pages/maps/planes-simulated',
      }
    ],
  },
];
