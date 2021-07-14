import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { OrderPdfComponent } from './pages/order-pdf/order-pdf.component';
import { ProductsComponent } from './pages/products/products.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'product',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'product',
    component: ProductsComponent,
  },
  {
    path: 'order',
    component: OrderPdfComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
