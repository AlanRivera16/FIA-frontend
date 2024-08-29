import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsesoresPage } from './asesores.page';

describe('AsesoresPage', () => {
  let component: AsesoresPage;
  let fixture: ComponentFixture<AsesoresPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AsesoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
