import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IntroComponent } from './intro.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [IntroComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: IntroComponent
      }
    ])
  ],
  bootstrap: [IntroComponent]
})
export class IntroModule {}
