import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home as HomeLayout } from './layout/home/home';
import { Productslist } from './layout/productslist/productslist';
import { ProductDetails } from './layout/productslist/product-details/product-details';
import { Login } from './layout/login/login';
import { Signup } from './layout/signup/signup';
import { Cart } from './layout/cart/cart';
import { Account } from './layout/account/account';
import { Checkout } from './layout/checkout/checkout';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './dashboard/home/home';
import { Orders } from './layout/orders/orders';
import { OrderDetails } from './layout/order-details/order-details';
import { Testimonials } from './layout/testimonials/testimonials';
import { Faq } from './layout/faq/faq';
import { About } from './layout/about/about';
import { Contact } from './layout/contact/contact';
import { Policies } from './layout/policies/policies';
import { Products } from './dashboard/products/products';
import { ProductForm } from './dashboard/product-form/product-form';
import { Categories } from './dashboard/categories/categories';
import { AdminOrders } from './dashboard/admin-orders/admin-orders';
import { AdminTestimonials } from './dashboard/admin-testimonials/admin-testimonials';
import { AdminFaq } from './dashboard/admin-faq/admin-faq';
import { AdminShipping } from './dashboard/admin-shipping/admin-shipping';
import { AdminUsers } from './dashboard/admin-users/admin-users';
import { NotFound } from './shared/not-found/not-found';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeLayout },
      { path: 'product-list', component: Productslist },
      { path: 'product-list/:slug', component: ProductDetails },
      { path: 'login', component: Login },
      { path: 'signup', component: Signup },
      { path: 'cart', component: Cart },
      { path: 'account', component: Account, canActivate: [authGuard] },
      { path: 'checkout', component: Checkout, canActivate: [authGuard] },
      { path: 'orders', component: Orders, canActivate: [authGuard] },
      { path: 'orders/:id', component: OrderDetails, canActivate: [authGuard] },
      { path: 'testimonials', component: Testimonials },
      { path: 'faq', component: Faq },
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
      { path: 'policies', component: Policies },
    ],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'products', component: Products },
      { path: 'products/new', component: ProductForm },
      { path: 'products/:id/edit', component: ProductForm },
      { path: 'categories', component: Categories },
      { path: 'orders', component: AdminOrders },
      { path: 'testimonials', component: AdminTestimonials },
      { path: 'faq', component: AdminFaq },
      { path: 'shipping', component: AdminShipping },
      { path: 'users', component: AdminUsers },
    ],
  },
  { path: '**', component: NotFound },
];
