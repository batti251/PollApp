import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCarousel } from './survey-carousel';

describe('SurveyCarousel', () => {
  let component: SurveyCarousel;
  let fixture: ComponentFixture<SurveyCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
