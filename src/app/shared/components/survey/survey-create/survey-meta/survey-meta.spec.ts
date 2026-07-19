import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyMeta } from './survey-meta';

describe('SurveyMeta', () => {
  let component: SurveyMeta;
  let fixture: ComponentFixture<SurveyMeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyMeta],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyMeta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
