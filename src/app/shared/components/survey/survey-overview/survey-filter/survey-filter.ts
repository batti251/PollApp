import { Component, inject } from '@angular/core';
import { SurveyService } from '../../../../services/survey';
import { Survey } from '../../../../interfaces/survey';

@Component({
  selector: 'app-survey-filter',
  imports: [],
  templateUrl: './survey-filter.html',
  styleUrl: './survey-filter.scss',
})
export class SurveyFilter {
  db = inject(SurveyService);
  activeBtn = 0;
  selectedCategory: number | null = null;

  async ngOnInit(): Promise<void> {
    await this.db.loadSurveyList('surveys');
    await this.db.loadExpireSoonSurvey();
    this.activeBtn = 0;
    this.selectedCategory = null;
    this.applyFilters();
  }

  /**
   * Sets one of the button-Filters
   * 
   * @param buttonIndex - the according button (0: Active surveys; 1: Closed surveys; 2: All surveys)
   */
  setBtnFilter(buttonIndex: number) {
    this.activeBtn = buttonIndex;
    if (buttonIndex == 2) {
      this.resetDropdownSelect()
    }
    this.applyFilters();
  }

  /**
   * Resets the selected dropdown option
   */
  resetDropdownSelect() {
    this.selectedCategory = null;
    this.db.activeCategory.set(-1);
  }


  /**
   * 
   * @param event - the change-Event from the select-tag
   */
  setCategoryFilter(event: Event) {
    let selectedElement = event.target as HTMLSelectElement;
    let value = selectedElement.value

    if (!value) {
      this.resetDropdownSelect()
      this.activeBtn = 2
      this.applyFilters();
      return;
    }
    this.selectedCategory = Number(value);
    this.db.activeCategory.set(this.selectedCategory);
    this.applyFilters();
  }

  /**
   * Filtersall survey from surveyList according to the set Filters by the user
   * Sets matched surveys into filteredSurveyList-Signal  
   */
  applyFilters() {
    let selectedCategory = this.selectedCategory !== null ? this.db.category[this.selectedCategory] : null;
    let filteredSurveys = this.db.surveyList().filter((survey) => {
      let matchesCategory = this.matchesCategory(survey, selectedCategory?.tag);
      let matchesStatus = this.matchesStatus(survey);
      return matchesCategory && matchesStatus;
    });
    this.db.filteredSurveyList.set(filteredSurveys);
  }

  /**
   * Tests the @param survey.category against the selected @param categoryTag
   * @param survey - the surveyList from SurveyService
   * @param categoryTag - the selected Category from dropdown-menu
   * @returns - (true: when categoryTag was selected || when survey.category matches the selected categoryTag)
   *             (false: when survey.category doesn't match the selected categoryTag)
   */
  matchesCategory(survey: Survey, categoryTag?: string): boolean {
    if (!categoryTag) {
      return true;
    }
    return survey.category == categoryTag;
  }

  /**
   * Tests the status against the current Date and the set activeBtn-Flag
   * 
   * @param survey - the surveyList from SurveyService
   * @returns 
   */
  matchesStatus(survey: Survey): boolean {
    let currentDate = new Date().getTime();
    if (!survey.endDate && this.activeBtn == 2) {
      return true;
    } else if (!survey.endDate){
      return false
    }
    let surveyEnd = new Date(survey.endDate).getTime()

    return this.matchActiveBtn(surveyEnd, currentDate)
  }


  /**
   * Tests @param surveyEnd against @param currentDate  according to the activeBtn-State
   * @param surveyEnd 
   * @param currentDate 
   * @returns 
   */
  matchActiveBtn(surveyEnd: number, currentDate:number):boolean {
    if (this.activeBtn == 0) {
      return surveyEnd > currentDate;
    } else if (this.activeBtn == 1) {
      return surveyEnd < currentDate;
    } else
    return true
  }
}