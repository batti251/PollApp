import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../../services/survey';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-survey-carousel',
  imports: [RouterLink],
  templateUrl: './survey-carousel.html',
  styleUrl: './survey-carousel.scss',
})
export class SurveyCarousel {
   db = inject(SurveyService)

   
}
