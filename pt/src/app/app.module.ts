import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { CartComponent } from './component/cart/cart.component';
import { ProductsComponent } from './component/products/products.component';
import { ProfileComponent } from './component/profile/profile.component';
import { LoginComponent } from './component/login/login.component';
import { FilterPipe } from './pipes/filter.pipe';
import { ToastComponent } from './component/toast/toast.component';
import { CheckoutFormComponent } from './component/checkout-form/checkout-form.component';
import { ProductFormComponent } from './component/product-form/product-form.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './service/auth.service';
import { AuthGuard } from './guard/auth.guard';
import { RegisterComponent } from './component/register/register.component';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { CategoryModalComponent } from './component/category-modal/category-modal.component';
import { ProductGridComponent } from './component/product-grid/product-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CartComponent,
    ProductsComponent,
    ProfileComponent,
    LoginComponent,
    FilterPipe,
    ToastComponent,
    CheckoutFormComponent,
    ProductFormComponent,
    RegisterComponent,
    CategoryModalComponent,
    ProductGridComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ApolloModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'https://api.escuelajs.co/graphql'
          })
        };
      },
      deps: [HttpLink]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
