import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFilter } from './survey-filter';

describe('SurveyFilter', () => {
  let component: SurveyFilter;
  let fixture: ComponentFixture<SurveyFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
