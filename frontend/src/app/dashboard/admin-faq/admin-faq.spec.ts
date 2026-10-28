import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminFaq } from './admin-faq';

describe('AdminFaq', () => {
  let component: AdminFaq;
  let fixture: ComponentFixture<AdminFaq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFaq],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFaq);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
