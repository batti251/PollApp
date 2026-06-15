import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { ActivatedRoute, Router } from '@angular/router';
import { Survey } from '../../../interfaces/survey';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { PercentPipe

 } from '@angular/common';
@Component({
  selector: 'app-survey-results-live',
  imports: [PercentPipe],
  templateUrl: './survey-results-live.html',
  styleUrl: './survey-results-live.scss',
  providers: [SurveyService]
})
export class SurveyResultsLive {
  db = inject(SurveyService)

  private activatedRoute = inject(ActivatedRoute);
  surveyResults = signal<Survey>({
    surveyName: "",
    endDate: "",
    description: "",
    category: "",
    type: 'survey',
    totalSubmitsCount: 0,
    questions: []
  })

  sortedResults:any

  async ngOnInit() {
    console.log(this.db.answerSignal());
    
    console.log(this.db.allEvents);
    let surveyId = this.activatedRoute.snapshot.paramMap.get('id')
    let dbResponse = await this.db.readSingleSurveyDB('surveys', surveyId) as Survey[]
    this.surveyResults.set(dbResponse[0]);
    this.sortedResults = this.surveyResults().questions.map((answer:any) => {
      console.log(answer);
      answer.answers.sort(this.sortId)
      
    })

    this.getTotalsPerAnswer()
    console.log(this.surveyResults().questions[0].answers);
    console.log(this.surveyResults().questions[1].answers);
    
  }

 sortId(a:any,b:any):any{
    if (a.id < b.id) {
      return -1
    } else 1
  }

  reduceArray = 0
  totalObj: {
    "id" : number,
    "total" : number
  } = {
    "id" : 0,
    "total" : 0
  }
  array : any[] = []

  getTotalsPerAnswer() {
    console.log(this.surveyResults());
    this.surveyResults().questions.map((questionArray) => {
      questionArray.answers.forEach((answerObj,i) => {
        if (answerObj.checkedCount) {
          this.reduceArray += answerObj.checkedCount
          this.totalObj = {
            id: answerObj.questionId,
            total: this.reduceArray
          }
        }
      })
      this.array.push(this.totalObj)
      this.reduceArray = 0 
    })
  }

}
