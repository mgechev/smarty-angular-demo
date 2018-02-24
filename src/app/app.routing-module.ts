import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    loadChildren: './intro/intro.module#IntroModule',
    path: 'intro'
  },
  {
    loadChildren: './main/main.module#MainModule',
    path: 'main'
  }
];
