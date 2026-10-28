import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminShipping } from './admin-shipping';

describe('AdminShipping', () => {
  let component: AdminShipping;
  let fixture: ComponentFixture<AdminShipping>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShipping],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminShipping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
