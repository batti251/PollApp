import { Component, Inject, inject } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { Survey } from '../../../interfaces/survey';
import { signal } from '@angular/core';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { SurveyQuestionsAnswers } from '../../../interfaces/survey-questions-answers';
import { RouterLink } from "@angular/router";
import { filter } from 'rxjs';

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  templateUrl: './survey-overview.html',
  styleUrl: './survey-overview.scss',
})
export class SurveyOverview {

  db = inject(SurveyService)
  list: Survey[] = []
  surveyQuestionList = signal<SurveyQuestions[]>([])
  surveyQAList = signal<SurveyQuestionsAnswers[]>([])
  categories = [{ value: 0, tag: "" }];


  async ngOnInit() {
    await this.db.loadSurveyList('surveys')
    await this.db.loadExpireSoonSurvey()
    console.log(this.db.toExpire());
    this.categories = this.db.category
    this.db.filteredSurveyList.set(this.db.surveyList())
  }

  filterSurveys(x: any) {
    let filteredTag = this.categories[x]
    this.db.filterSurveys(filteredTag)
    console.log(this.db.filteredSurveyList());

  }

  filterActiveSurvey(boolean: boolean) {
    
    let currentDate = new Date(new Date().toISOString().split('T')[0]).getTime()
    let tempList = []
    console.log(currentDate);
    
    switch (boolean) {
      case true:
        this.db.surveyList().forEach(e => {
          if (((currentDate - (new Date(`${e.endDate}`).getTime())) < 0) && e.endDate != "") {
            tempList.push(e)
          }
          console.log((currentDate - (new Date(`${e.endDate}`).getTime())));
          console.log(e.endDate);
          
          this.db.filteredSurveyList.set(tempList)
        }
        )
        break;
      default:
        this.db.surveyList().forEach(e => {
          if (((currentDate - new Date(`${e.endDate}`).getTime()) > 0) && e.endDate != "") {
            tempList.push(e)
          }
          this.db.filteredSurveyList.set(tempList)
        }
        )
        break;
    }
  }




  /**
   * Calculates the difference between both given date-strings
   * @param dateA 
   * @param dateB 
   * @returns 
   */
  calcExpiryDate(dateA: string, dateB: string): number {
    let newDateA = new Date(dateA)
    let newDateB = new Date(dateB)
    console.log(new Date(newDateB.getTime()));
    
   let diff = newDateB.getTime() - newDateA.getTime()
    return diff / (1000*60 * 60 * 24)
  }


}
