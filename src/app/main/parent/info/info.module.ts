import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { InfoComponent } from './info.component';

@NgModule({
  declarations: [InfoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InfoComponent
      }
    ])
  ],
  bootstrap: [InfoComponent]
})
export class InfoModule {}
