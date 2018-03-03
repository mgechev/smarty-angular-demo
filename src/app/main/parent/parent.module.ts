import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ParentComponent } from './parent.component';
import { SettingsComponent } from './settings/settings.component';
import { PersonalizeComponent } from './personalize/personalize.component';
import { RewardComponent } from './reward/reward.component';
import { InfoComponent } from './info/info.component';
import { VerifyComponent } from './verify/verify.component';
import { FaqComponent } from './faq/faq.component';

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
        path: 'settings',
        loadChildren: './settings/settings.module#SettingsModule'
      },
      {
        path: 'personalize',
        loadChildren: './personalize/personalize.module#PersonalizeModule'
      },
      {
        path: 'reward',
        loadChildren: './reward/reward.module#RewardModule'
      },
      {
        path: 'reward/:id',
        loadChildren: './reward/reward.module#RewardModule'
      },
      {
        path: 'home',
        loadChildren: './parent-home/parent-home.module#ParentHomeModule'
      },
      {
        path: 'faq',
        loadChildren: './faq/faq.module#FaqModule'
      },
      {
        path: 'info',
        loadChildren: './info/info.module#InfoModule'
      },
      {
        path: 'verify',
        loadChildren: './verify/verify.module#VerifyModule'
      }
    ])
  ],
  bootstrap: [ParentComponent]
})
export class ParentModule {}
