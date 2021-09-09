import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapsComponent } from './maps.component';
import { PlanesDockerizedMapComponent } from './planes-dockerized/planes-dockerized.component';
import { PlanesSimulatedMapComponent } from './planes-simulated/planes-simulated.component';


const routes: Routes = [{
  path: '',
  component: MapsComponent,
  children: [ {
      path: 'planes-dockerized',
      component: PlanesDockerizedMapComponent,
    }, {
      path: 'planes-simulated',
      component: PlanesSimulatedMapComponent,
    }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapsRoutingModule { }

export const routedComponents = [
  MapsComponent,
  PlanesDockerizedMapComponent,
  PlanesSimulatedMapComponent,
];
