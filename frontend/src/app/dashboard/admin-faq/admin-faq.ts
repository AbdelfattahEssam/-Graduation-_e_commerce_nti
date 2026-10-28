import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaqService } from '../../core/services/faq.service';
import { IFaq } from '../../core/models/faq.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-admin-faq',
  styleUrl: './admin-faq.css',
  templateUrl: './admin-faq.html',
})
export class AdminFaq implements OnInit {

  private _faqService = inject(FaqService);
  private _cdr = inject(ChangeDetectorRef);

  faqs: IFaq[] = [];
  isLoading = true;
  errorMessage = '';

  showForm = false;
  editingId: string | null = null;
  isSaving = false;

  form = new FormGroup({
    question: new FormControl('', [Validators.required]),
    answer: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.load();
  }

  load() {
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

  openAdd() {
    this.editingId = null;
    this.errorMessage = '';
    this.form.reset({ question: '', answer: '' });
    this.showForm = true;
  }

  openEdit(faq: IFaq) {
    this.editingId = faq._id;
    this.errorMessage = '';
    this.form.patchValue({ question: faq.question, answer: faq.answer });
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const data = {
      question: this.form.value.question ?? '',
      answer: this.form.value.answer ?? ''
    };

    const request = this.editingId
      ? this._faqService.updateFaq(this.editingId, data)
      : this._faqService.createFaq(data);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeForm();
        this.load();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save the question';
        this.isSaving = false;
        this._cdr.detectChanges();
      }
    });
  }

  remove(faq: IFaq) {
    if (!confirm('Delete this question permanently?')) return;

    this._faqService.deleteFaq(faq._id).subscribe({
      next: () => this.load(),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete the question';
        this._cdr.detectChanges();
      }
    });
  }
}