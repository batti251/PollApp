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
  list: Survey[] = []
  surveyQuestionList = signal<SurveyQuestions[]>([])
  surveyQAList = signal<SurveyQuestionsAnswers[]>([])


  async ngOnInit() {
    await this.db.loadSurveyList('surveys')
    await this.db.loadExpireSoonSurvey()
    this.db.filteredSurveyList.set(this.db.surveyList())
  }

  /**
   * Function Caller to filter Surveys by categories
   * @param categoryIndex - index from db.category
   */
  filterSurveysByCategory(categoryIndex: number) {
    this.db.filterSurveys(categoryIndex)
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
   * @param filterActiveSurvey - flag, wether to indicate the filteredSurveyList as active (true) or inactive(false) 
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
}
