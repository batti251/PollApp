import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyOverview } from './survey-overview';

describe('Overview', () => {
  let component: SurveyOverview;
  let fixture: ComponentFixture<SurveyOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
