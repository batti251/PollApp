import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { SurveyService } from '../../../../services/survey';

@Component({
  selector: 'app-survey-list',
  imports: [RouterLink],
  templateUrl: './survey-list.html',
  styleUrl: './survey-list.scss',
})
export class SurveyList {

  db = inject(SurveyService)


}
