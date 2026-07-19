import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyQuestion } from './survey-question';

describe('SurveyQuestion', () => {
  let component: SurveyQuestion;
  let fixture: ComponentFixture<SurveyQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
