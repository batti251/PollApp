import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { ActivatedRoute } from '@angular/router';
import { PercentPipe, JsonPipe} from '@angular/common';
import { AlphabetPipe } from '../../pipes/alphabet.pipe';
import { SurveyLive } from '../../../services/survey-live';

@Component({
  selector: 'app-survey-results-live',
  imports: [PercentPipe, AlphabetPipe],
  templateUrl: './survey-results-live.html',
  styleUrl: './survey-results-live.scss',
})
export class SurveyResultsLive {
  db = inject(SurveyService)
  live = inject(SurveyLive)
  activatedRoute = inject(ActivatedRoute);

  async ngOnInit() {
    let surveyId = this.activatedRoute.snapshot.paramMap.get('id') as string
    await this.db.loadLiveSurvey('surveys', surveyId)
    this.live.getTotalsPerAnswer()
  }


}
