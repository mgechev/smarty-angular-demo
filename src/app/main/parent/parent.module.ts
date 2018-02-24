import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ParentComponent } from './parent.component';

@NgModule({
  declarations: [ParentComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ParentComponent
      }
    ])
  ],
  bootstrap: [ParentComponent]
})
export class ParentModule {}
