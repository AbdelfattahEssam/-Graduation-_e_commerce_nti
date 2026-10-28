import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FaqService } from '../../core/services/faq.service';
import { IFaq } from '../../core/models/faq.model';

@Component({
  imports: [],
  selector: 'app-faq',
  styleUrl: './faq.css',
  templateUrl: './faq.html',
})
export class Faq implements OnInit {

  private _faqService = inject(FaqService);
  private _cdr = inject(ChangeDetectorRef);

  faqs: IFaq[] = [];
  isLoading = true;
  errorMessage = '';
  openIndex = -1;

  ngOnInit(): void {
    this._faqService.getFaqs().subscribe({
      next: (res) => {
        this.faqs = res.data.faqs;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load FAQs';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? -1 : index;
  }
}