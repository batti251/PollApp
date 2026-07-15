import { Component, Inject, inject } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { Survey } from '../../../interfaces/survey';
import { signal } from '@angular/core';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { SurveyQuestionsAnswers } from '../../../interfaces/survey-questions-answers';
import { RouterLink } from "@angular/router";
import { filter, Timestamp } from 'rxjs';

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


  filterSurveysByCategory(categoryIndex: number) {
    let filteredTag = this.categories[categoryIndex]
    this.db.filterSurveys(filteredTag)
  }

  /**
   * calls {@link setfilteredSurveyList} according to @param filterActiveSurvey
   * if no @param is set, filteredSurveyList will be reset
   * @param filterActiveSurvey - flag, wether to indicate the filteredSurveyList as active (true), inactive(false), or reset (empty)
   */
  filterSurveyOverview(filterActiveSurvey?: boolean) {
    let currentDate = new Date(new Date().toISOString().split('T')[0]).getTime()
    switch (filterActiveSurvey) {
      case true:
        this.setfilteredSurveyList(currentDate, true)
        break;
      case false:
        this.setfilteredSurveyList(currentDate, false)
        break;
      default:
        this.db.filteredSurveyList.set(this.db.surveyList())
    }
  }


  /**
   * Sets filteredSurveyList() according the @param filterActiveSurvey-calculation 
   * @param currentDate - current Date-object as timestamp
   * @param filterActiveSurvey - flag, wether to indicate the filteredSurveyList as active (true), inactive(false) 
   */
  setfilteredSurveyList(currentDate: number, filterActiveSurvey: boolean) {
    let tempSurveyList = []
    this.db.surveyList().forEach(e => {
      if (filterActiveSurvey) {
        if (((currentDate - (new Date(`${e.endDate}`).getTime())) < 0) && e.endDate != "") {
          tempSurveyList.push(e)
        }
      } else if (!filterActiveSurvey) {
        if (((currentDate - new Date(`${e.endDate}`).getTime()) > 0) && e.endDate != "") {
          tempSurveyList.push(e)
        }
      }
      this.db.filteredSurveyList.set(tempSurveyList)
    }
    )
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
    let diff = newDateB.getTime() - newDateA.getTime()
    return diff / (1000 * 60 * 60 * 24)
  }


}
