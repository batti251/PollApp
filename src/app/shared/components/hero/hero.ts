import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyOverview } from '../survey/survey-overview/survey-overview'; 

@Component({
  selector: 'app-hero',
  imports: [RouterLink, SurveyOverview],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}
