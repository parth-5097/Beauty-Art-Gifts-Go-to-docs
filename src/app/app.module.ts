import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import {
  AngularFireStorageModule,
  AngularFireStorageReference,
  AngularFireUploadTask,
  createStorageRef,
} from '@angular/fire/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsComponent } from './pages/products/products.component';
import { LoginComponent } from './pages/login/login.component';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { DataTablesModule } from 'angular-datatables';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { OrderPdfComponent } from './pages/order-pdf/order-pdf.component';
import { ViewOrderPdfComponent } from './pages/view-order-pdf/view-order-pdf.component';

@NgModule({
  declarations: [AppComponent, ProductsComponent, LoginComponent, OrderPdfComponent, ViewOrderPdfComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    DataTablesModule,
    SlickCarouselModule,
    ToastrModule.forRoot(),
  ],
  providers: [{ provide: createStorageRef, useValue: 'your' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
