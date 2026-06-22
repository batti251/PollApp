import { Component, inject } from '@angular/core';
import { SurveyService } from '../../services/survey';
import { Survey } from '../../interfaces/survey';
import { signal } from '@angular/core';
import { SurveyQuestions } from '../../interfaces/survey-questions';
import { SurveyQuestionsAnswers } from '../../interfaces/survey-questions-answers';
import { RouterLink } from "@angular/router";
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, JsonPipe],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

  db = inject(SurveyService)
  list:Survey[] = []
  surveyQuestionList  = signal<SurveyQuestions[]>([])
  surveyQAList  = signal<SurveyQuestionsAnswers[]>([])
  toExpire = signal<Survey[]>([])
  

  async ngOnInit() {
   await this.db.loadSurveyList('surveys') 
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
