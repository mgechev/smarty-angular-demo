import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IntroComponent } from './intro.component';
import { CommonModule } from '@angular/common';
import { ParentComponent } from './parent/parent.component';
import { LoginComponent } from './login/login.component';
import { PersonalizeComponent } from './parent/personalize/personalize.component';
import { InfoComponent } from './parent/info/info.component';
import { RewardComponent } from './parent/reward/reward.component';

@NgModule({
  declarations: [IntroComponent, ParentComponent, LoginComponent, PersonalizeComponent, InfoComponent, RewardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: IntroComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'parent',
        component: ParentComponent,
        children: [
          {
            path: 'personalize',
            component: PersonalizeComponent
          },
          {
            path: 'info',
            component: InfoComponent
          },
          {
            path: 'reward',
            component: RewardComponent
          },
          {
            path: 'reward/:id',
            component: RewardComponent
          }
        ]
      }
    ])
  ],
  bootstrap: [IntroComponent]
})
export class IntroModule {}
