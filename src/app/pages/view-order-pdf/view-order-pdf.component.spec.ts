import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrderPdfComponent } from './view-order-pdf.component';

describe('ViewOrderPdfComponent', () => {
  let component: ViewOrderPdfComponent;
  let fixture: ComponentFixture<ViewOrderPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewOrderPdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOrderPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
