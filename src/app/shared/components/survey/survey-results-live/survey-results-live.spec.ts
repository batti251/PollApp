import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyResultsLive } from './survey-results-live';

describe('SurveyResultsLive', () => {
  let component: SurveyResultsLive;
  let fixture: ComponentFixture<SurveyResultsLive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyResultsLive],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyResultsLive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
