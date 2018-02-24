import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { RewardsComponent } from './rewards.component';

@NgModule({
  declarations: [RewardsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: RewardsComponent
      }
    ])
  ],
  bootstrap: [RewardsComponent]
})
export class RewardsModule {}
