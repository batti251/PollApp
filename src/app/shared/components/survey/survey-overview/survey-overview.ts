import { Component } from '@angular/core';
import { SurveyCarousel } from "./survey-carousel/survey-carousel";
import { SurveyList } from "./survey-list/survey-list";
import { SurveyFilter } from "./survey-filter/survey-filter";

@Component({
  selector: 'app-overview',
  imports: [SurveyCarousel, SurveyList, SurveyFilter],
  templateUrl: './survey-overview.html',
  styleUrl: './survey-overview.scss',
})
export class SurveyOverview {

}
