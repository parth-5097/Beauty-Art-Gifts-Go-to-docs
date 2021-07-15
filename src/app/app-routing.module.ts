import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { OrderPdfComponent } from './pages/order-pdf/order-pdf.component';
import { ProductsComponent } from './pages/products/products.component';
import { ViewOrderPdfComponent } from './pages/view-order-pdf/view-order-pdf.component';

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
  {
    path: 'order/:id',
    component: ViewOrderPdfComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
