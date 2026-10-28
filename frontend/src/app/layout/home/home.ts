import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { IProduct } from '../../core/models/product.model';
import { ITestimonial } from '../../core/models/testimonial.model';
import { Product } from '../productslist/product/product';

@Component({
  imports: [RouterLink, Product],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {

  private _productService = inject(ProductService);
  private _testimonialService = inject(TestimonialService);
  private _cdr = inject(ChangeDetectorRef);

  latestProducts: IProduct[] = [];
  testimonials: ITestimonial[] = [];
  stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this._productService.getAllProducts({ sort: 'newest', limit: 4 }).subscribe({
      next: (res) => {
        this.latestProducts = res.data.products;
        this._cdr.detectChanges();
      }
    });

    this._testimonialService.getApproved().subscribe({
      next: (res) => {
        this.testimonials = res.data.testimonials.slice(0, 3);
        this._cdr.detectChanges();
      }
    });
  }
}