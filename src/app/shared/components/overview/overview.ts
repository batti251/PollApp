import { Component, inject } from '@angular/core';
import { SurveyService } from '../../services/survey';
import { Survey } from '../../interfaces/survey';
import { signal } from '@angular/core';
import { SurveyQuestions } from '../../interfaces/survey-questions';
import { SurveyQuestionsAnswers } from '../../interfaces/survey-questions-answers';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

  db = inject(SurveyService)
  list:Survey[] = []
  surveyList = signal<Survey[]>([])
  surveyQuestionList  = signal<SurveyQuestions[]>([])
  surveyQAList  = signal<SurveyQuestionsAnswers[]>([])
  toExpire = signal<Survey[]>([])
  

  async ngOnInit() {
   let survey = await this.db.readDB('surveys') as Survey[];
   let surveyQ = await this.db.readDB('survey-questions') as SurveyQuestions[];
   let surveyQA = await this.db.readDB('survey-questions-answers') as SurveyQuestionsAnswers[];
   let expireSoon = await this.db.readExpireSoonDB('surveys') as Survey[];
    this.surveyList.set(survey) ;
    this.surveyQuestionList.set(surveyQ) ;
    this.surveyQAList.set(surveyQA) ;
    this.toExpire.set(expireSoon);
   
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
