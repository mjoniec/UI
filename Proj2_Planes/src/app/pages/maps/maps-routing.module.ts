import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapsComponent } from './maps.component';
import { BubbleMapComponent } from './bubble/bubble-map.component';


const routes: Routes = [{
  path: '',
  component: MapsComponent,
  children: [{
    path: 'bubble',
    component: BubbleMapComponent,
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapsRoutingModule { }

export const routedComponents = [
  MapsComponent,
  BubbleMapComponent
];
