import { SurveyQuestionsAnswers } from "./survey-questions-answers";

export interface SurveyQuestions {
        questionInput: string,
        value: string | boolean | number,
        multipleChoice: boolean,
        answers: SurveyQuestionsAnswers[]
}
