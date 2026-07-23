import { inject, Injectable } from '@angular/core';
import { SurveyQuestionsAnswers } from '../interfaces/survey-questions-answers';
import { SurveyService } from './survey';

@Injectable({
  providedIn: 'root',
})
export class SurveyLive {
  db = inject(SurveyService);

  selectedAnswerIds: number[][] = [];

  totalAnswerCounts: {
    id: number;
    total: number;
  }[] = [];


  /**
   * Updates the multiple Answers on questionIndex position
   * Adds or removes all answerIds, according to the checked-state from the input
   * @param questionIndex - index from survey().questions
   * @param answerId - the given answerId from Supabase
   * @param checked - flag to check if input-field is currrently checked
   */
  updateSelectedAnswer(questionIndex: number, answerId: number, checked: boolean) {
    if (!this.selectedAnswerIds[questionIndex]) {
      this.selectedAnswerIds[questionIndex] = [];
    }
    let selectedIds = this.selectedAnswerIds[questionIndex];
    let selectedIndex = selectedIds.indexOf(answerId);
    if (checked && selectedIndex == -1) {
      selectedIds.push(answerId);
    }
    if (!checked && selectedIndex != -1) {
      selectedIds.splice(selectedIndex, 1);
    }
  }

  /**
   * Updates the single Answer on questionIndex position
   * @param questionIndex - index from survey().questions
   * @param answerId - the given answerId from Supabase
   */
  updateSingleChoiceAnswer(questionIndex: number, answerId: number) {
    this.selectedAnswerIds[questionIndex] = [answerId];
  }

  /**
   * Gets the current  value for each Answer in the survey
   * When an answer is selected, it increases the originalCount by 1 to display
   * @param questionIndex - index from survey().questions
   * @param answer - the answer Object
   * @returns 
   */
  getDisplayedCount(questionIndex: number, answer: SurveyQuestionsAnswers): number {
    let originalCount = answer.checkedCount ?? 0;
    return this.isAnswerSelected(questionIndex, answer.id) ? originalCount + 1 : originalCount;
  }

/**
 * Tests if an possible answer was chosen, properly
 * @param questionIndex - index from survey().questions
 * @param answer - the answer Object
 * @returns - (true: when answer was chosen; false when no answer was chosen, yet)
 */
  isAnswerSelected(questionIndex: number, answerId?: number): boolean {
    if (answerId == undefined) {
      return false;
    }
    return (this.selectedAnswerIds[questionIndex]?.includes(answerId) ?? false);
  }


  /**
   * Displays the currentTotal Count for progress-tag
   * When an answer was picked, it will be add to the originalTotal
   * @param questionIndex - index from survey().questions
   * @returns - the addition of the originalTotal from the db and the addedVote, when answer was picked
   */
  getDisplayedTotal(questionIndex: number): number {
    let currentTotal = this.totalAnswerCounts[questionIndex]?.total ?? 0;
    let addedVotes = this.selectedAnswerIds[questionIndex]?.length ?? 0;
    return currentTotal + addedVotes;
  }

  /**
   * Displays the currentTotal percentage count for progress-tag
   * When an answer was picked, it will be add to the total
   * @param questionIndex - index from survey().questions
   * @returns - the addition of the originalTotal from the db and the addedVote, when answer was picked
   */
  getDisplayedPercentage(questionIndex: number, answer: SurveyQuestionsAnswers): number {
    let total = this.getDisplayedTotal(questionIndex);
    if (total == 0) {
      return 0;
    }
    return this.getDisplayedCount(questionIndex, answer) / total;
  }

  /**
   * Adds all total answers and pushes it to totalAnswerCounts[]
   */
  getTotalsPerAnswer() {
    this.totalAnswerCounts = [];
    this.db.survey().questions.forEach((question) => {
      let total = question.answers.reduce(
        (sum, answer) => sum + (answer.checkedCount ?? 0), 0);
      this.totalAnswerCounts.push({id: question.id ?? 0,total});
    });
  }
}