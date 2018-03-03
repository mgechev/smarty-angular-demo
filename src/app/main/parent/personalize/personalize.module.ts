import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { PersonalizeComponent } from './personalize.component';

@NgModule({
  declarations: [PersonalizeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PersonalizeComponent
      }
    ])
  ],
  bootstrap: [PersonalizeComponent]
})
export class PersonalizeModule {}
