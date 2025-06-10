// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { AuthGuardService } from './guards/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/home/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [AuthGuardService],
    canLoad: [AuthGuardService],
    data: { roles: ['admin'] },
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./modules/products/products.module').then(
        (m) => m.ProductsModule
      ),
    canActivate: [AuthGuardService],
    canLoad: [AuthGuardService],
    data: { roles: ['admin'] },
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./modules/categories/categories.module').then(
        (m) => m.CategoriesModule
      ),
    canActivate: [AuthGuardService],
    canLoad: [AuthGuardService],
  },
  {
    path: 'page',
    loadChildren: () =>
      import('./modules/home/page/page.module').then((m) => m.PageModule),
    canActivate: [AuthGuardService],
    canLoad: [AuthGuardService],
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./modules/cart/cart.module').then((m) => m.CartModule),
    canActivate: [AuthGuardService],
    canLoad: [AuthGuardService],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
