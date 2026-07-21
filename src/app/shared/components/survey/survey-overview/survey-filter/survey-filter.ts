import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../../services/survey';

@Component({
  selector: 'app-survey-filter',
  imports: [],
  templateUrl: './survey-filter.html',
  styleUrl: './survey-filter.scss',
})
export class SurveyFilter {
  db = inject(SurveyService)
  btnIsClicked = false

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
   * Adds to the clicked button the class ".active", to imply the current, active filter
   * It removes from all buttons the class ".active", to prevent missleading UI-feedback
   * @param index - the button-id
   */
  setBtnActive(index:any){
    let btns = document.querySelectorAll('.btn')
    let btn = document.getElementById(`btn-${index}`)
    btns.forEach((btn) => btn?.classList.remove("active"));
    btn?.classList.add("active")
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
