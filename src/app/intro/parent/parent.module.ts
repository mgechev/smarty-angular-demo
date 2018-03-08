import { ParentComponent } from './parent.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ParentComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ParentComponent
      },
      {
        path: 'personalize',
        loadChildren: './personalize/personalize.module#IntroPersonalizeModule'
      },
      {
        path: 'info',
        loadChildren: './info/info.module#IntroInfoModule'
      },
      {
        path: 'reward',
        loadChildren: './reward/reward.module#IntroRewardModule'
      },
      {
        path: 'reward/:id',
        loadChildren: './reward/reward.module#IntroRewardModule'
      }
    ])
  ],
  bootstrap: [ParentComponent]
})
export class IntroParentModule {}
