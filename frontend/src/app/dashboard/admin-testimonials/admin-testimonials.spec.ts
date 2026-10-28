import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTestimonials } from './admin-testimonials';

describe('AdminTestimonials', () => {
  let component: AdminTestimonials;
  let fixture: ComponentFixture<AdminTestimonials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTestimonials],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTestimonials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
