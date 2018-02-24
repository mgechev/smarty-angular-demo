import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { KidComponent } from './kid.component';

@NgModule({
  declarations: [KidComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: KidComponent
      },
      {
        loadChildren: './home/home.module#HomeModule',
        path: 'home'
      },
      {
        loadChildren: './earn/earn.module#EarnModule',
        path: 'earn'
      },
      {
        loadChildren: './rewards/rewards.module#RewardsModule',
        path: 'rewards'
      }
    ])
  ],
  bootstrap: [KidComponent]
})
export class KidModule {}
