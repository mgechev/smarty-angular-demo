import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ParentComponent } from './parent.component';
import { SettingsComponent } from './settings/settings.component';
import { PersonalizeComponent } from './personalize/personalize.component';
import { RewardComponent } from './reward/reward.component';
import { InfoComponent } from './info/info.component';
import { VerifyComponent } from './verify/verify.component';
import { HomeComponent } from './home/home.component';
import { FaqComponent } from './faq/faq.component';

@NgModule({
  declarations: [
    ParentComponent,
    SettingsComponent,
    PersonalizeComponent,
    RewardComponent,
    InfoComponent,
    VerifyComponent,
    HomeComponent,
    FaqComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ParentComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'personalize',
        component: PersonalizeComponent
      },
      {
        path: 'reward',
        component: RewardComponent
      },
      {
        path: 'reward/:id',
        component: RewardComponent
      },
      {
        path: 'home',
        component: PersonalizeComponent
      },
      {
        path: 'faq',
        component: RewardComponent
      },
      {
        path: 'info',
        component: InfoComponent
      },
      {
        path: 'verify',
        component: VerifyComponent
      }
    ])
  ],
  bootstrap: [ParentComponent]
})
export class ParentModule {}
