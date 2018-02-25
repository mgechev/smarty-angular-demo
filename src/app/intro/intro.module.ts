import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IntroComponent } from './intro.component';
import { CommonModule } from '@angular/common';
import { ParentComponent } from './parent/parent.component';

@NgModule({
  declarations: [IntroComponent, ParentComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: IntroComponent
      },
      {
        path: 'parent',
        component: ParentComponent
      }
    ])
  ],
  bootstrap: [IntroComponent]
})
export class IntroModule {}
