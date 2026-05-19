import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSurvey } from './form-survey';

describe('FormSurvey', () => {
  let component: FormSurvey;
  let fixture: ComponentFixture<FormSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSurvey],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
