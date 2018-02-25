import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { KidComponent } from './kid.component';
import { QuestionComponent } from './question/question.component';
import { FriendsComponent } from './friends/friends.component';
import { ReportsComponent } from './reports/reports.component';

@NgModule({
  declarations: [KidComponent, QuestionComponent, FriendsComponent, ReportsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'question/:standard/:question/:id',
        component: QuestionComponent
      },
      {
        path: 'question/:standard/:question',
        component: QuestionComponent
      },
      {
        path: 'friends',
        component: FriendsComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: '',
        component: KidComponent,
        children: [
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
        ]
      }
    ])
  ],
  bootstrap: [KidComponent]
})
export class KidModule {}
