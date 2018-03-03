import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { RewardComponent } from './reward.component';

@NgModule({
  declarations: [RewardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: RewardComponent
      }
    ])
  ],
  bootstrap: [RewardComponent]
})
export class RewardModule {}
