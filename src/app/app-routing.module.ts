import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { DashboardPage } from './dashboard/dashboard.page';
import { AsesoresPage } from './asesores/asesores.page';
import { ClientesPage } from './clientes/clientes.page';
import { PrestamosPage } from './prestamos/prestamos.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  // },
  {
    path: 'home',
    component: HomePage,
    children: [
      {
        path: 'dashboard',
        children: [
          {
            path:'', 
            loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
          }
        ]
      },
      {
        path: 'asesores',
        children: [
          {
            path:'', 
            loadChildren: () => import('./asesores/asesores.module').then( m => m.AsesoresPageModule)
          }
        ]
      },
      {
        path: 'clientes',
        children: [
          {
            path:'', 
            loadChildren: () => import('./clientes/clientes.module').then( m => m.ClientesPageModule)
          }
        ]
      },
      {
        path: 'prestamos',
        children: [
          {
            path:'', 
            loadChildren: () => import('./prestamos/prestamos.module').then( m => m.PrestamosPageModule)
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  // },
  // {
  //   path: 'asesores',
  //   loadChildren: () => import('./asesores/asesores.module').then( m => m.AsesoresPageModule)
  // },
  // {
  //   path: 'clientes',
  //   loadChildren: () => import('./clientes/clientes.module').then( m => m.ClientesPageModule)
  // },
  // {
  //   path: 'prestamos',
  //   loadChildren: () => import('./prestamos/prestamos.module').then( m => m.PrestamosPageModule)
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
