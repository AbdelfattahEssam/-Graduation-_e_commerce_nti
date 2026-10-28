import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IProduct } from '../../../core/models/product.model';
import { enveronment } from '../../../../environments/env';

@Component({
  imports: [RouterLink],
  selector: 'app-product',
  styleUrl: './product.css',
  templateUrl: './product.html',
})
export class Product {
  @Input() myProduct!: IProduct;
  staticURL = enveronment.staticURL;
}