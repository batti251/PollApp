import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { ActivatedRoute } from '@angular/router';
import { PercentPipe, JsonPipe} from '@angular/common';
import { AlphabetPipe } from '../../pipes/alphabet.pipe';

@Component({
  selector: 'app-survey-results-live',
  imports: [PercentPipe, AlphabetPipe, JsonPipe],
  templateUrl: './survey-results-live.html',
  styleUrl: './survey-results-live.scss',
})
export class SurveyResultsLive {
  db = inject(SurveyService)
  private activatedRoute = inject(ActivatedRoute);

  async ngOnInit() {
    let surveyId = this.activatedRoute.snapshot.paramMap.get('id') as string
    await this.db.loadLiveSurvey('surveys', surveyId)
    this.getTotalsPerAnswer()
  }

  totalAnswerCount = 0
  totalAnswerCountObj: {
    "id" : number,
    "total" : number
  } = {
    "id" : 0,
    "total" : 0
  }
  totalAnswerCounts : {
    "id" : number,
    "total" : number
  }[] = []


  /**
   * Sets for each question the total amount of submitted answers
   */
  getTotalsPerAnswer() {
    this.db.survey().questions.map((questionArray) => {
      questionArray.answers.forEach((answerObj,i) => {
        if (answerObj.checkedCount) {
          this.totalAnswerCount += answerObj.checkedCount
          this.totalAnswerCountObj = {
            id: answerObj.questionId,
            total: this.totalAnswerCount
          }
        }
      })
      this.totalAnswerCounts.push(this.totalAnswerCountObj)
      this.totalAnswerCount = 0 
    })
  }

}
