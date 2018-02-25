import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { RewardsComponent } from './rewards.component';
import { GamesComponent } from './games/games.component';
import { BadgesComponent } from './badges/badges.component';

@NgModule({
  declarations: [RewardsComponent, GamesComponent, BadgesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: RewardsComponent
      },
      {
        path: 'games/:id',
        component: GamesComponent
      },
      {
        path: 'games',
        component: GamesComponent
      },
      {
        path: 'badges/:id',
        component: BadgesComponent
      },
      {
        path: 'badges',
        component: BadgesComponent
      },
      {
        path: 'badges',
        component: BadgesComponent
      }
    ])
  ],
  bootstrap: [RewardsComponent]
})
export class RewardsModule {}
