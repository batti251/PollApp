import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { Survey } from '../../../interfaces/survey';
import { signal } from '@angular/core';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { SurveyQuestionsAnswers } from '../../../interfaces/survey-questions-answers';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  templateUrl: './survey-overview.html',
  styleUrl: './survey-overview.scss',
})
export class SurveyOverview {

  db = inject(SurveyService)
  list:Survey[] = []
  surveyQuestionList  = signal<SurveyQuestions[]>([])
  surveyQAList  = signal<SurveyQuestionsAnswers[]>([])
  

  async ngOnInit() {
   await this.db.loadSurveyList('surveys') 
   await this.db.loadExpireSoonSurvey()
   console.log(this.db.toExpire());
   
  }


  /**
   * Calculates the difference between both given date-strings
   * @param dateA 
   * @param dateB 
   * @returns 
   */
  calcExpiryDate(dateA:string, dateB: string):number{
    let newDateA = new Date(dateA)
    let newDateB = new Date(dateB)
    return newDateB.getDate() - newDateA.getDate()
    
  }


}
